import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, ticketCode, reason } = body;

    if (!orderId && !ticketCode) {
      return NextResponse.json(
        { success: false, message: 'ID de commande ou code de ticket requis' },
        { status: 400 }
      );
    }

    const whereClause = orderId ? { id: orderId } : { ticketCode };

    const order = await prisma.order.findUnique({
      where: whereClause as any,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Commande / Ticket introuvable' },
        { status: 404 }
      );
    }

    const cancelReason = reason?.trim() || 'Paiement refusé ou annulé par l\'administrateur';

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        errorMessage: cancelReason,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Le ticket de commande a été annulé avec succès.',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error cancelling ticket:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}
