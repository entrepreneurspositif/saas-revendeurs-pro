import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllPaymentMethods } from '@/lib/payment-methods';
import { convertUsdToXof } from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode } = body;

    if (!ticketCode) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const methods = await getAllPaymentMethods();
    const custom = methods.custom;

    if (!custom.enabled) {
      return NextResponse.json(
        { success: false, message: 'Cette passerelle de paiement est actuellement désactivée.' },
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
      const otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
        },
      });

      if (otpOrder) {
        amountUsd = otpOrder.sellingPrice;
        description = `Commande OTP ${otpOrder.service.toUpperCase()} (${otpOrder.ticketCode})`;
      } else {
        return NextResponse.json({ success: false, message: 'Ticket non trouvé' }, { status: 404 });
      }
    }

    const amountXof = convertUsdToXof(amountUsd);

    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/custom-gateway/callback`;

    let redirectUrl = custom.checkoutUrl;
    if (redirectUrl) {
      redirectUrl = redirectUrl
        .replace('{ticketCode}', encodeURIComponent(ticketCode))
        .replace('{amountXOF}', String(amountXof))
        .replace('{amountUSD}', String(amountUsd))
        .replace('{callbackUrl}', encodeURIComponent(callbackUrl))
        .replace('{siteId}', encodeURIComponent(custom.siteId));
    }

    return NextResponse.json({
      success: true,
      ticketCode,
      gatewayName: custom.name,
      amountUSD: amountUsd,
      amountXOF: amountXof,
      description,
      redirectUrl,
      callbackUrl,
    });
  } catch (error: any) {
    console.error('Custom Gateway Init Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
