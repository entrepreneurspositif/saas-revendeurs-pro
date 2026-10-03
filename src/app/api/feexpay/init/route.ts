import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFeexPayConfig, convertUsdToXof } from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

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
    let description = '';

    if (order) {
      amountUsd = order.totalAmount;
      description = `Achat ${order.productTitle} (${order.ticketCode})`;
    } else {
      // Check OTP order
      const otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
        },
      });

      if (otpOrder) {
        amountUsd = otpOrder.sellingPrice;
        description = `Commande SMS OTP ${otpOrder.service.toUpperCase()} (${otpOrder.ticketCode})`;
      } else {
        return NextResponse.json({ success: false, message: 'Ticket non trouvé' }, { status: 404 });
      }
    }

    const amountXof = convertUsdToXof(amountUsd);

    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/feexpay/callback`;

    const checkoutUrl = `https://checkout.feexpay.me/?id=${config.shopId}&token=${config.apiKey}&amount=${amountXof}&custom_id=${encodeURIComponent(ticketCode)}&callback_url=${encodeURIComponent(callbackUrl)}`;

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
