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
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      include: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      store: {
        storeName: tenant.storeName,
        tagline: tenant.tagline,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
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
        facebookPixelId: tenant.facebookPixelId,
        tiktokPixelId: tenant.tiktokPixelId,
        googleAnalyticsId: tenant.googleAnalyticsId,
        welcomeMessage: tenant.welcomeMessage,
        floatingChatEnabled: tenant.floatingChatEnabled ?? true,
        plan: tenant.plan,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reseller store:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      include: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(tenant.plan?.features || '[]');
    } catch (e) {
      parsedFeatures = [];
    }

    const body = await req.json();
    const {
      storeName,
      tagline,
      subdomain,
      customDomain,
      logoUrl,
      bannerUrl,
      themeColor,
      themePreset,
      fontFamily,
      buttonColor,
      buttonTextColor,
      buttonRadius,
      contactEmail,
      contactPhone,
      contactWhatsApp,
      contactTelegram,
      bannerAnnouncement,
      paymentInstructions,
      facebookPixelId,
      tiktokPixelId,
      googleAnalyticsId,
      welcomeMessage,
      floatingChatEnabled,
    } = body;

    const updateData: any = {};

    if (storeName !== undefined) updateData.storeName = storeName.trim();
    if (tagline !== undefined) updateData.tagline = tagline.trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl?.trim() || null;
    if (themeColor !== undefined) updateData.themeColor = themeColor.trim();
    if (themePreset !== undefined) updateData.themePreset = themePreset.trim();
    if (fontFamily !== undefined) updateData.fontFamily = fontFamily.trim();
    if (buttonColor !== undefined) updateData.buttonColor = buttonColor.trim();
    if (buttonTextColor !== undefined) updateData.buttonTextColor = buttonTextColor.trim();
    if (buttonRadius !== undefined) updateData.buttonRadius = buttonRadius.trim();
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail?.trim() || null;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone?.trim() || null;
    if (contactWhatsApp !== undefined) updateData.contactWhatsApp = contactWhatsApp?.trim() || null;
    if (contactTelegram !== undefined) updateData.contactTelegram = contactTelegram?.trim() || null;
    if (bannerAnnouncement !== undefined) updateData.bannerAnnouncement = bannerAnnouncement?.trim() || null;
    if (paymentInstructions !== undefined) updateData.paymentInstructions = paymentInstructions?.trim() || null;
    if (facebookPixelId !== undefined) updateData.facebookPixelId = facebookPixelId ? String(facebookPixelId).trim() : null;
    if (tiktokPixelId !== undefined) updateData.tiktokPixelId = tiktokPixelId ? String(tiktokPixelId).trim() : null;
    if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = googleAnalyticsId ? String(googleAnalyticsId).trim() : null;
    if (welcomeMessage !== undefined) updateData.welcomeMessage = welcomeMessage ? String(welcomeMessage).trim() : null;
    if (floatingChatEnabled !== undefined) updateData.floatingChatEnabled = Boolean(floatingChatEnabled);

    // Subdomain change check
    if (subdomain !== undefined && subdomain.trim() !== '') {
      const cleanSub = sanitizeSubdomain(subdomain);
      if (cleanSub.length < 3) {
        return NextResponse.json(
          { success: false, message: 'Le sous-domaine doit comporter au moins 3 caractères' },
          { status: 400 }
        );
      }

      if (cleanSub !== tenant.subdomain) {
        const existing = await prisma.tenant.findFirst({
          where: {
            subdomain: cleanSub,
            id: { not: tenant.id },
          },
        });
        if (existing) {
          return NextResponse.json(
            { success: false, message: `Le sous-domaine "${cleanSub}" est déjà utilisé par un autre revendeur.` },
            { status: 400 }
          );
        }
        updateData.subdomain = cleanSub;
      }
    }

    // Custom Domain change check
    if (customDomain !== undefined) {
      const cleanDomain = customDomain ? customDomain.trim().toLowerCase() : null;
      if (cleanDomain && cleanDomain !== tenant.customDomain) {
        // Check if plan allows custom_domain
        if (!parsedFeatures.includes('custom_domain')) {
          return NextResponse.json(
            {
              success: false,
              message: 'La connexion d\'un nom de domaine personnalisé nécessite l\'offre Pro.',
            },
            { status: 403 }
          );
        }

        const existingDomain = await prisma.tenant.findFirst({
          where: {
            customDomain: cleanDomain,
            id: { not: tenant.id },
          },
        });
        if (existingDomain) {
          return NextResponse.json(
            { success: false, message: `Ce nom de domaine (${cleanDomain}) est déjà configuré sur une autre boutique.` },
            { status: 400 }
          );
        }
        updateData.customDomain = cleanDomain;
      } else if (cleanDomain === null) {
        updateData.customDomain = null;
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres de la vitrine enregistrés avec succès !',
      store: updatedTenant,
    });
  } catch (error: any) {
    console.error('Error updating store:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
