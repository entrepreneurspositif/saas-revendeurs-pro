import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFeexPayConfig, convertUsdToXof } from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

function sanitizeDescription(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode } = body;

    if (!ticketCode) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const config = await getFeexPayConfig();

    if (!config.enabled) {
      return NextResponse.json(
        { success: false, message: 'Le paiement par FeexPay est actuellement désactivé par l\'administrateur.' },
        { status: 400 }
      );
    }

    // Check standard product order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ ticketCode }, { id: ticketCode }],
      },
    });

    let amountUsd = 0;
    let rawDescription = '';

    if (order) {
      amountUsd = order.totalAmount;
      rawDescription = `Achat ${order.productTitle} ${order.ticketCode}`;
    } else {
      // Check OTP order
      const otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
        },
      });

      if (otpOrder) {
        amountUsd = otpOrder.sellingPrice;
        rawDescription = `Commande SMS OTP ${otpOrder.service.toUpperCase()} ${otpOrder.ticketCode}`;
      } else {
        return NextResponse.json({ success: false, message: 'Ticket non trouvé' }, { status: 404 });
      }
    }

    const amountXof = convertUsdToXof(amountUsd);
    const description = sanitizeDescription(rawDescription) || `Commande ${ticketCode}`;

    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/feexpay/callback`;
    const callbackErrorUrl = `${protocol}://${host}/api/feexpay/callback?status=FAILED`;

    // Call FeexPay V2 API to generate payment link
    const feexPayRes = await fetch('https://api-v2.feexpay.me/api/feexlinks/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        shop: config.shopId,
        amount: amountXof,
        description,
        paymentMethod: 'ALL',
        expireIn: 60,
        range: 0,
        custom_id: ticketCode,
        callback_url: callbackUrl,
        callback_error: callbackErrorUrl,
      }),
    });

    const data = await feexPayRes.json().catch(() => ({}));

    if (!feexPayRes.ok || (!data.urlPay && !data.url)) {
      console.error('FeexPay API V2 Error:', data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Erreur lors de la génération du lien de paiement FeexPay',
          details: data,
        },
        { status: 400 }
      );
    }

    const checkoutUrl = data.urlPay || data.url;

    return NextResponse.json({
      success: true,
      ticketCode,
      amountUSD: amountUsd,
      amountXOF: amountXof,
      description,
      shopId: config.shopId,
      apiKey: config.apiKey,
      callbackUrl,
      paymentUrl: checkoutUrl,
      message: 'Paramètres de paiement FeexPay générés avec succès.',
    });
  } catch (error: any) {
    console.error('FeexPay Init Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
