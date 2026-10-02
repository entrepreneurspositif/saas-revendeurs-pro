import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buyOnlineSimNumber } from '@/lib/onlinesim';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'ID de commande OTP requis' },
        { status: 400 }
      );
    }

    const otpOrder = await prisma.otpOrder.findFirst({
      where: {
        OR: [{ id: orderId }, { ticketCode: orderId.toUpperCase() }],
      },
    });

    if (!otpOrder) {
      return NextResponse.json(
        { success: false, message: 'Commande OTP introuvable' },
        { status: 404 }
      );
    }

    if (otpOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: 'Cette commande OTP a déjà été livrée' },
        { status: 400 }
      );
    }

    // Launch OnlineSIM number reservation
    const result = await buyOnlineSimNumber(otpOrder.service, otpOrder.country);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Échec d'attribution OnlineSIM: ${result.message || 'Numéro non disponible'}`,
        },
        { status: 400 }
      );
    }

    // Update OTP order with reserved number details and status WAITING_SMS
    const updatedOrder = await prisma.otpOrder.update({
      where: { id: otpOrder.id },
      data: {
        tzid: result.tzid || 0,
        phone: result.phone || '',
        costPrice: result.costPrice || otpOrder.costPrice,
        status: 'WAITING_SMS',
        errorMessage: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Paiement validé ! Numéro ${updatedOrder.phone} attribué avec succès sur OnlineSIM.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
