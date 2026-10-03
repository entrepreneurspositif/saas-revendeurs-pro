import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllPaymentMethods } from '@/lib/payment-methods';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const methods = await getAllPaymentMethods();
    return NextResponse.json({ success: true, methods });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      manualEnabled,
      feexpayEnabled,
      feexpayApiKey,
      feexpayShopId,
      customEnabled,
      customName,
      customApiKey,
      customSiteId,
      customCheckoutUrl,
      customInstructions,
    } = body;

    const updates = [
      { key: 'manual_payment_enabled', value: manualEnabled ? 'true' : 'false' },
      { key: 'feexpay_enabled', value: feexpayEnabled ? 'true' : 'false' },
      { key: 'feexpay_api_key', value: String(feexpayApiKey || '').trim() },
      { key: 'feexpay_shop_id', value: String(feexpayShopId || '').trim() },
      { key: 'custom_gateway_enabled', value: customEnabled ? 'true' : 'false' },
      { key: 'custom_gateway_name', value: String(customName || '').trim() },
      { key: 'custom_gateway_api_key', value: String(customApiKey || '').trim() },
      { key: 'custom_gateway_site_id', value: String(customSiteId || '').trim() },
      { key: 'custom_gateway_checkout_url', value: String(customCheckoutUrl || '').trim() },
      { key: 'custom_gateway_instructions', value: String(customInstructions || '').trim() },
    ];

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    const updatedMethods = await getAllPaymentMethods();

    return NextResponse.json({
      success: true,
      methods: updatedMethods,
      message: 'Modes de paiement et passerelles enregistrés avec succès !',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
