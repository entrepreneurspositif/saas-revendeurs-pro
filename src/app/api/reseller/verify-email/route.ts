import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmailVerificationEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token')?.trim();

    const host = req.headers.get('host') || '';
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://abonnementspro.com').replace(/\/$/, '');
    const baseUrl = (host && !host.includes('localhost')) ? `https://${host}` : appUrl;

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/reseller/dashboard?tab=profile&emailError=missing_token`);
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        emailVerificationCode: token,
      },
    });

    if (!tenant) {
      return NextResponse.redirect(`${baseUrl}/reseller/dashboard?tab=profile&emailError=invalid_token`);
    }

    if (tenant.emailVerificationExpiresAt && tenant.emailVerificationExpiresAt < new Date()) {
      return NextResponse.redirect(`${baseUrl}/reseller/dashboard?tab=profile&emailError=expired_token`);
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
    });

    const res = NextResponse.redirect(`${baseUrl}/reseller/dashboard?tab=profile&emailVerified=true`);
    // Ensure session is set if not already
    res.cookies.set('reseller_session', tenant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error: any) {
    console.error('Error verifying email via link:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ success: false, message: 'Compte revendeur introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;

    const host = req.headers.get('host') || '';
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://abonnementspro.com').replace(/\/$/, '');
    const baseUrl = (host && !host.includes('localhost')) ? `https://${host}` : appUrl;

    // 1. SEND OR RESEND VERIFICATION EMAIL
    if (action === 'send') {
      if (tenant.emailVerified) {
        return NextResponse.json({
          success: true,
          message: 'Votre adresse e-mail est déjà vérifiée.',
          alreadyVerified: true,
        });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationExpiresAt: expiresAt,
        },
      });

      const verifyUrl = `${baseUrl}/api/reseller/verify-email?token=${verificationCode}`;

      const mailResult = await sendEmailVerificationEmail({
        to: tenant.email,
        name: tenant.name,
        code: verificationCode,
        verifyUrl,
      });

      if (mailResult.notConfigured) {
        return NextResponse.json({
          success: true,
          mockCode: verificationCode,
          message: `Code de vérification généré : ${verificationCode} (Serveur SMTP en cours de configuration)`,
        });
      }

      if (!mailResult.success) {
        return NextResponse.json(
          { success: false, message: mailResult.error || "Erreur lors de l'envoi de l'e-mail." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Un code de vérification à 6 chiffres a été envoyé à ${tenant.email}. Vérifiez votre boîte de réception (et vos spams).`,
      });
    }

    // 2. VERIFY CODE
    if (action === 'verify') {
      const { code } = body;
      const cleanCode = String(code || '').trim();

      if (!cleanCode) {
        return NextResponse.json({ success: false, message: 'Veuillez saisir le code à 6 chiffres.' }, { status: 400 });
      }

      if (tenant.emailVerified) {
        return NextResponse.json({
          success: true,
          message: 'Votre adresse e-mail est déjà vérifiée.',
        });
      }

      if (!tenant.emailVerificationCode || tenant.emailVerificationCode.trim() !== cleanCode) {
        return NextResponse.json(
          { success: false, message: 'Le code de vérification saisi est incorrect.' },
          { status: 400 }
        );
      }

      if (tenant.emailVerificationExpiresAt && tenant.emailVerificationExpiresAt < new Date()) {
        return NextResponse.json(
          { success: false, message: 'Ce code a expiré. Veuillez en demander un nouveau.' },
          { status: 400 }
        );
      }

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationCode: null,
          emailVerificationExpiresAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Félicitations ! Votre adresse e-mail a été vérifiée avec succès. Vous recevrez désormais vos alertes de ventes et retraits en direct.',
      });
    }

    return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in email verification route:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
