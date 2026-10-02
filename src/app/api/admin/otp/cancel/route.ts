import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

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

    const updatedOrder = await prisma.otpOrder.update({
      where: { id: otpOrder.id },
      data: {
        status: 'CANCELLED',
        errorMessage: reason || 'Paiement non reçu ou invalidé par l\'administrateur.',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket OTP annulé avec succès.',
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
