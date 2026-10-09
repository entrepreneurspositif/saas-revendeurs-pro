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
      select: {
        facebookPixelId: true,
        tiktokPixelId: true,
        googleAnalyticsId: true,
        welcomeMessage: true,
        floatingChatEnabled: true,
        bannerAnnouncement: true,
        contactWhatsApp: true,
        contactTelegram: true,
        contactEmail: true,
        contactPhone: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      marketing: {
        facebookPixelId: tenant.facebookPixelId || '',
        tiktokPixelId: tenant.tiktokPixelId || '',
        googleAnalyticsId: tenant.googleAnalyticsId || '',
        welcomeMessage: tenant.welcomeMessage || '',
        floatingChatEnabled: tenant.floatingChatEnabled ?? true,
        bannerAnnouncement: tenant.bannerAnnouncement || '',
        contactWhatsApp: tenant.contactWhatsApp || '',
        contactTelegram: tenant.contactTelegram || '',
        contactEmail: tenant.contactEmail || '',
        contactPhone: tenant.contactPhone || '',
      },
    });
  } catch (error: any) {
    console.error('Error fetching reseller marketing settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const {
      facebookPixelId,
      tiktokPixelId,
      googleAnalyticsId,
      welcomeMessage,
      floatingChatEnabled,
      bannerAnnouncement,
      contactWhatsApp,
      contactTelegram,
      contactEmail,
      contactPhone,
    } = body;

    const updated = await prisma.tenant.update({
      where: { id: sessionToken },
      data: {
        facebookPixelId: facebookPixelId !== undefined ? String(facebookPixelId).trim() : undefined,
        tiktokPixelId: tiktokPixelId !== undefined ? String(tiktokPixelId).trim() : undefined,
        googleAnalyticsId: googleAnalyticsId !== undefined ? String(googleAnalyticsId).trim() : undefined,
        welcomeMessage: welcomeMessage !== undefined ? String(welcomeMessage).trim() : undefined,
        floatingChatEnabled: floatingChatEnabled !== undefined ? Boolean(floatingChatEnabled) : undefined,
        bannerAnnouncement: bannerAnnouncement !== undefined ? String(bannerAnnouncement).trim() : undefined,
        contactWhatsApp: contactWhatsApp !== undefined ? String(contactWhatsApp).trim() : undefined,
        contactTelegram: contactTelegram !== undefined ? String(contactTelegram).trim() : undefined,
        contactEmail: contactEmail !== undefined ? String(contactEmail).trim() : undefined,
        contactPhone: contactPhone !== undefined ? String(contactPhone).trim() : undefined,
      },
      select: {
        facebookPixelId: true,
        tiktokPixelId: true,
        googleAnalyticsId: true,
        welcomeMessage: true,
        floatingChatEnabled: true,
        bannerAnnouncement: true,
        contactWhatsApp: true,
        contactTelegram: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres Marketing, Pixels et Communication enregistrés avec succès !',
      marketing: updated,
    });
  } catch (error: any) {
    console.error('Error updating reseller marketing settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
