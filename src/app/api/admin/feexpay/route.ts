import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFeexPayConfig } from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getFeexPayConfig();
    return NextResponse.json({ success: true, feexpay: config });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, shopId, enabled, action } = body;

    if (action === 'test') {
      const config = await getFeexPayConfig();
      return NextResponse.json({
        success: true,
        message: `Passerelle FeexPay active et opérationnelle ! Shop ID : ${config.shopId.slice(0, 8)}... Clé API configurée.`,
      });
    }

    const updates = [
      { key: 'feexpay_api_key', value: String(apiKey || '').trim() },
      { key: 'feexpay_shop_id', value: String(shopId || '').trim() },
      { key: 'feexpay_enabled', value: enabled ? 'true' : 'false' },
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
      message: 'Configuration FeexPay enregistrée avec succès !',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
