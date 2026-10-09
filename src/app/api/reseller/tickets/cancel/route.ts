import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const { orderId, ticketCode } = await req.json();

    if (!orderId && !ticketCode) {
      return NextResponse.json(
        { success: false, message: 'ID de commande ou code ticket requis' },
        { status: 400 }
      );
    }

    const whereClause: any = orderId ? { id: orderId } : { ticketCode };

    const order = await prisma.order.findUnique({
      where: whereClause,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Ticket introuvable' }, { status: 404 });
    }

    if (order.tenantId !== sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'êtes pas autorisé à annuler ce ticket' },
        { status: 403 }
      );
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: 'Impossible d\'annuler un ticket déjà livré' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket annulé avec succès',
      order: updated,
    });
  } catch (error: any) {
    console.error('Error cancelling reseller ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
