import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEmail } from '@/lib/emailValidator';
import { isMaliciousPayload, sanitizeText, sanitizeMultilineText } from '@/lib/sanitizer';

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

function sanitizeField(input: any, maxLen: number = 500): string | null {
  if (input === undefined || input === null) return null;
  const str = String(input).trim();
  if (!str) return null;
  return str.replace(/[<>]/g, '').slice(0, maxLen);
}

function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('data:image/')) return true;
  if (clean.startsWith('/')) return true;
  if (clean.includes('webhook.site') || clean.includes('burpcollaborator') || clean.includes('oastify') || clean.includes('interact.sh')) {
    return false;
  }
  return clean.startsWith('https://');
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
        productTemplate: tenant.productTemplate || 'grid-modern',
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

    // STRICT SECURITY: Email verification required before store configuration
    if (!tenant.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Veuillez valider votre adresse e-mail avant de configurer votre boutique. Consultez votre boîte de réception ou validez votre code dans le tableau de bord.',
          code: 'EMAIL_NOT_VERIFIED',
        },
        { status: 403 }
      );
    }

    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(tenant.plan?.features || '[]');
    } catch (e) {
      parsedFeatures = [];
    }

    const body = await req.json();

    // Check for malicious payload across all text fields
    for (const [key, val] of Object.entries(body)) {
      if (typeof val === 'string' && isMaliciousPayload(val)) {
        return NextResponse.json(
          { success: false, message: `Champ '${key}' invalide : contenu non autorisé ou script détecté.` },
          { status: 400 }
        );
      }
    }

    const {
      storeName,
      tagline,
      subdomain,
      customDomain,
      logoUrl,
      bannerUrl,
      themeColor,
      themePreset,
      productTemplate,
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

    if (storeName !== undefined) updateData.storeName = sanitizeField(storeName, 100) || tenant.storeName;
    if (tagline !== undefined) updateData.tagline = sanitizeField(tagline, 200) || '';
    if (logoUrl !== undefined) {
      if (!isSafeImageUrl(logoUrl)) {
        return NextResponse.json({ success: false, message: 'URL de logo non autorisée.' }, { status: 400 });
      }
      updateData.logoUrl = logoUrl?.trim() || null;
    }
    if (bannerUrl !== undefined) {
      if (!isSafeImageUrl(bannerUrl)) {
        return NextResponse.json({ success: false, message: 'URL de bannière non autorisée.' }, { status: 400 });
      }
      updateData.bannerUrl = bannerUrl?.trim() || null;
    }
    if (themeColor !== undefined) updateData.themeColor = sanitizeField(themeColor, 30) || 'sky';
    if (themePreset !== undefined) updateData.themePreset = sanitizeField(themePreset, 50) || 'cyber-dark';
    if (productTemplate !== undefined) updateData.productTemplate = sanitizeField(productTemplate, 50) || 'grid-modern';
    if (fontFamily !== undefined) updateData.fontFamily = sanitizeField(fontFamily, 50) || 'Inter';
    if (buttonColor !== undefined) updateData.buttonColor = sanitizeField(buttonColor, 30) || '#0284c7';
    if (buttonTextColor !== undefined) updateData.buttonTextColor = sanitizeField(buttonTextColor, 30) || '#ffffff';
    if (buttonRadius !== undefined) updateData.buttonRadius = sanitizeField(buttonRadius, 30) || 'rounded-xl';
    if (contactEmail !== undefined) {
      if (contactEmail && contactEmail.trim()) {
        const valEmail = await validateEmail(contactEmail.trim(), false);
        if (!valEmail.isValid) {
          return NextResponse.json(
            { success: false, message: `Email de contact invalide : ${valEmail.error}` },
            { status: 400 }
          );
        }
        updateData.contactEmail = valEmail.cleanEmail;
      } else {
        updateData.contactEmail = null;
      }
    }
    if (contactPhone !== undefined) updateData.contactPhone = sanitizeField(contactPhone, 30);
    if (contactWhatsApp !== undefined) updateData.contactWhatsApp = sanitizeField(contactWhatsApp, 30);
    if (contactTelegram !== undefined) updateData.contactTelegram = sanitizeField(contactTelegram, 50);
    if (bannerAnnouncement !== undefined) updateData.bannerAnnouncement = sanitizeField(bannerAnnouncement, 300);
    if (paymentInstructions !== undefined) updateData.paymentInstructions = sanitizeField(paymentInstructions, 1000);
    if (facebookPixelId !== undefined) updateData.facebookPixelId = sanitizeField(facebookPixelId, 50);
    if (tiktokPixelId !== undefined) updateData.tiktokPixelId = sanitizeField(tiktokPixelId, 50);
    if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = sanitizeField(googleAnalyticsId, 50);
    if (welcomeMessage !== undefined) updateData.welcomeMessage = sanitizeField(welcomeMessage, 500);
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
      let cleanDomain = customDomain ? customDomain.trim().toLowerCase() : null;
      if (cleanDomain && cleanDomain !== tenant.customDomain) {
        // Sanitize and strip protocol/slashes/ports
        cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0].trim();

        // Strict validation: must be a real public domain name, no loopback, no private IPs
        const isValidDomain = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(cleanDomain);
        const isForbidden = /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)/.test(cleanDomain);

        if (!isValidDomain || isForbidden) {
          return NextResponse.json(
            { success: false, message: 'Format de domaine invalide. Exemple valide : boutique.mondomaine.com (sans http, ni adresse IP locale)' },
            { status: 400 }
          );
        }

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
