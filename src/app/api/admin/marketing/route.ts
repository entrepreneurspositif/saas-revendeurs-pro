import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'facebook_pixel_id',
            'tiktok_pixel_id',
            'google_analytics_id',
            'promo_banner_active',
            'promo_banner_text',
            'promo_banner_bg',
            'promo_banner_link',
          ],
        },
      },
    });

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      marketing: {
        facebookPixelId: settingsMap['facebook_pixel_id'] || '',
        tiktokPixelId: settingsMap['tiktok_pixel_id'] || '',
        googleAnalyticsId: settingsMap['google_analytics_id'] || '',
        promoBannerActive: settingsMap['promo_banner_active'] === 'true',
        promoBannerText: settingsMap['promo_banner_text'] || '🔥 Offre Spéciale Entrepreneurs: Bénéficiez des tarifs réduits sur nos abonnements & numéros OTP !',
        promoBannerBg: settingsMap['promo_banner_bg'] || 'indigo',
        promoBannerLink: settingsMap['promo_banner_link'] || '/exclusifs',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      facebookPixelId,
      tiktokPixelId,
      googleAnalyticsId,
      promoBannerActive,
      promoBannerText,
      promoBannerBg,
      promoBannerLink,
    } = body;

    const updates = [
      { key: 'facebook_pixel_id', value: String(facebookPixelId || '').trim() },
      { key: 'tiktok_pixel_id', value: String(tiktokPixelId || '').trim() },
      { key: 'google_analytics_id', value: String(googleAnalyticsId || '').trim() },
      { key: 'promo_banner_active', value: promoBannerActive ? 'true' : 'false' },
      { key: 'promo_banner_text', value: String(promoBannerText || '').trim() },
      { key: 'promo_banner_bg', value: String(promoBannerBg || 'indigo').trim() },
      { key: 'promo_banner_link', value: String(promoBannerLink || '/exclusifs').trim() },
    ];

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres Marketing & Pixels enregistrés avec succès.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
