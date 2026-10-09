import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, reseller: null });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      include: {
        plan: true,
      },
    });

    if (!tenant || !tenant.isActive) {
      const res = NextResponse.json({ authenticated: false, reseller: null });
      res.cookies.delete('reseller_session');
      return res;
    }

    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(tenant.plan?.features || '[]');
    } catch (e) {
      parsedFeatures = [];
    }

    return NextResponse.json({
      authenticated: true,
      reseller: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        storeName: tenant.storeName,
        tagline: tenant.tagline,
        logoUrl: tenant.logoUrl,
        bannerUrl: tenant.bannerUrl,
        themeColor: tenant.themeColor,
        themePreset: tenant.themePreset || 'cyber-dark',
        fontFamily: tenant.fontFamily || 'Inter',
        buttonColor: tenant.buttonColor || '#0284c7',
        buttonTextColor: tenant.buttonTextColor || '#ffffff',
        buttonRadius: tenant.buttonRadius || 'rounded-xl',
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        contactWhatsApp: tenant.contactWhatsApp,
        contactTelegram: tenant.contactTelegram,
        bannerAnnouncement: tenant.bannerAnnouncement,
        paymentInstructions: tenant.paymentInstructions,
        walletBalance: tenant.walletBalance,
        totalEarnings: tenant.totalEarnings,
        customGatewayEnabled: Boolean(tenant.customGatewayEnabled),
        feexpayApiKey: tenant.feexpayApiKey || '',
        feexpayShopId: tenant.feexpayShopId || '',
        feexpayEnabled: Boolean(tenant.feexpayEnabled),
        monerooSecretKey: tenant.monerooSecretKey || '',
        monerooEnabled: Boolean(tenant.monerooEnabled),
        plan: {
          id: tenant.plan?.id || tenant.planId,
          name: tenant.plan?.name || 'Free',
          description: tenant.plan?.description,
          priceMonthly: tenant.plan?.priceMonthly || 0,
          marginDiscountPercent: tenant.plan?.marginDiscountPercent || 0,
          features: parsedFeatures,
        },
      },
    });
  } catch (error: any) {
    console.error('Error verifying reseller session:', error);
    return NextResponse.json({ authenticated: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, storeName, subdomain, planId } = body;

    // LOGIN ACTION
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email et mot de passe requis' },
          { status: 400 }
        );
      }

      const tenant = await prisma.tenant.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { plan: true },
      });

      if (!tenant) {
        return NextResponse.json(
          { success: false, message: 'Aucun compte revendeur associé à cet email' },
          { status: 401 }
        );
      }

      if (!tenant.isActive) {
        return NextResponse.json(
          { success: false, message: 'Ce compte revendeur a été suspendu par l\'administrateur' },
          { status: 403 }
        );
      }

      if (tenant.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Mot de passe incorrect' },
          { status: 401 }
        );
      }

      const res = NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        reseller: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          subdomain: tenant.subdomain,
          storeName: tenant.storeName,
          planId: tenant.planId,
        },
      });

      res.cookies.set('reseller_session', tenant.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    // REGISTER ACTION
    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, message: 'Nom, email et mot de passe requis' },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();
      const existingEmail = await prisma.tenant.findUnique({
        where: { email: cleanEmail },
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: 'Un compte avec cet email existe déjà' },
          { status: 400 }
        );
      }

      // Generate or clean subdomain
      let cleanSubdomain = sanitizeSubdomain(subdomain || storeName || name);
      if (!cleanSubdomain || cleanSubdomain.length < 3) {
        cleanSubdomain = `boutique-${Date.now().toString(36)}`;
      }

      // Check subdomain availability
      const existingSubdomain = await prisma.tenant.findUnique({
        where: { subdomain: cleanSubdomain },
      });

      if (existingSubdomain) {
        cleanSubdomain = `${cleanSubdomain}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const chosenPlanId = planId || 'free';
      // Verify plan exists
      const plan = await prisma.saasPlan.findUnique({
        where: { id: chosenPlanId },
      });

      const assignedPlanId = plan ? plan.id : 'free';

      const newTenant = await prisma.tenant.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: password,
          storeName: storeName?.trim() || `${name.trim()}'s Store`,
          subdomain: cleanSubdomain,
          planId: assignedPlanId,
          themeColor: 'sky',
          tagline: 'Boutique officielle de licences et abonnements digitaux',
          walletBalance: 0.0,
          totalEarnings: 0.0,
        },
      });

      const res = NextResponse.json({
        success: true,
        message: 'Compte revendeur créé avec succès',
        reseller: {
          id: newTenant.id,
          name: newTenant.name,
          email: newTenant.email,
          subdomain: newTenant.subdomain,
          storeName: newTenant.storeName,
          planId: newTenant.planId,
        },
      });

      res.cookies.set('reseller_session', newTenant.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in reseller auth:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  res.cookies.delete('reseller_session');
  return res;
}
