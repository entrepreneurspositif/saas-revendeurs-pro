import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMonerooConfig, initializeMonerooPayment } from '@/lib/moneroo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode } = body;

    if (!ticketCode) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const config = await getMonerooConfig();

    if (!config.enabled) {
      return NextResponse.json(
        { success: false, message: 'Le paiement par Moneroo est actuellement désactivé par l\'administrateur.' },
        { status: 400 }
      );
    }

    // Look up standard product order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ ticketCode }, { id: ticketCode }],
      },
      include: {
        user: true,
      },
    });

    let amountUsd = 0;
    let description = '';
    let customerEmail = '';
    let customerName = '';

    if (order) {
      amountUsd = order.totalAmount;
      description = `Achat ${order.productTitle}`;
      customerEmail = order.user?.email || 'client@revente-abonnement.com';
      customerName = order.user?.name || 'Client Reseller';
    } else {
      // Look up OTP order
      const otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
        },
      });

      if (otpOrder) {
        amountUsd = otpOrder.sellingPrice;
        description = `Commande SMS OTP ${otpOrder.service.toUpperCase()}`;
        customerEmail = 'client@revente-abonnement.com';
        customerName = 'Client OTP';
      } else {
        return NextResponse.json({ success: false, message: 'Ticket non trouvé' }, { status: 404 });
      }
    }

    // Convert price to FCFA / XOF for Moneroo
    const amountXof = Math.max(50, Math.round((amountUsd || 0) * 650));

    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const returnUrl = `${protocol}://${host}/api/moneroo/callback?ticketCode=${encodeURIComponent(ticketCode)}`;

    const { checkoutUrl, paymentId } = await initializeMonerooPayment({
      amount: amountXof,
      currency: 'XOF',
      amountUsd,
      ticketCode,
      description,
      customerEmail,
      customerName,
      returnUrl,
    });

    return NextResponse.json({
      success: true,
      ticketCode,
      amountUSD: amountUsd,
      amountXOF: amountXof,
      paymentId,
      paymentUrl: checkoutUrl,
      message: 'Paiement Moneroo (FCFA) initialisé avec succès.',
    });
  } catch (error: any) {
    console.error('Moneroo Init Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
