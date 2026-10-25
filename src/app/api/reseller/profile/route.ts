import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      include: { plan: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ success: false, message: 'Compte revendeur introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        storeName: tenant.storeName,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        contactWhatsApp: tenant.contactWhatsApp,
        contactTelegram: tenant.contactTelegram,
        emailVerified: Boolean(tenant.emailVerified),
        emailVerifiedAt: tenant.emailVerifiedAt,
        notifyEmailOnOrder: tenant.notifyEmailOnOrder !== false,
        notifyEmailOnOtp: tenant.notifyEmailOnOtp !== false,
        notifyEmailOnPayout: tenant.notifyEmailOnPayout !== false,
        createdAt: tenant.createdAt,
        plan: {
          id: tenant.plan?.id || tenant.planId,
          name: tenant.plan?.name || 'Free',
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching reseller profile:', error);
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

    // 1. UPDATE PROFILE INFO
    if (action === 'update_profile') {
      const {
        name,
        contactPhone,
        contactWhatsApp,
        contactTelegram,
        notifyEmailOnOrder,
        notifyEmailOnOtp,
        notifyEmailOnPayout,
      } = body;

      if (!name || !name.trim()) {
        return NextResponse.json({ success: false, message: 'Le nom complet est obligatoire' }, { status: 400 });
      }

      const updated = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          name: name.trim(),
          contactPhone: contactPhone !== undefined ? contactPhone?.trim() || null : undefined,
          contactWhatsApp: contactWhatsApp !== undefined ? contactWhatsApp?.trim() || null : undefined,
          contactTelegram: contactTelegram !== undefined ? contactTelegram?.trim() || null : undefined,
          notifyEmailOnOrder: notifyEmailOnOrder !== undefined ? Boolean(notifyEmailOnOrder) : undefined,
          notifyEmailOnOtp: notifyEmailOnOtp !== undefined ? Boolean(notifyEmailOnOtp) : undefined,
          notifyEmailOnPayout: notifyEmailOnPayout !== undefined ? Boolean(notifyEmailOnPayout) : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Vos informations de profil ont été mises à jour avec succès.',
        reseller: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          contactPhone: updated.contactPhone,
          contactWhatsApp: updated.contactWhatsApp,
          contactTelegram: updated.contactTelegram,
          notifyEmailOnOrder: updated.notifyEmailOnOrder,
          notifyEmailOnOtp: updated.notifyEmailOnOtp,
          notifyEmailOnPayout: updated.notifyEmailOnPayout,
        },
      });
    }

    // 2. CHANGE PASSWORD
    if (action === 'change_password') {
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { success: false, message: 'Veuillez remplir tous les champs du mot de passe.' },
          { status: 400 }
        );
      }

      const cleanCurrent = String(currentPassword).trim();
      const dbPassword = String(tenant.password || '').trim();

      if (cleanCurrent !== dbPassword && currentPassword !== tenant.password) {
        return NextResponse.json(
          { success: false, message: 'Le mot de passe actuel est incorrect.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: 'La confirmation ne correspond pas au nouveau mot de passe.' },
          { status: 400 }
        );
      }

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          password: String(newPassword).trim(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Votre mot de passe a été modifié avec succès !',
      });
    }

    return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating reseller profile:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
