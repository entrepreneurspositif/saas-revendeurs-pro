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
        { success: false, message: 'ID ou code ticket requis' },
        { status: 400 }
      );
    }

    const whereClause: any = orderId ? { id: orderId } : { ticketCode };

    const otpOrder = await prisma.otpOrder.findUnique({
      where: whereClause,
    });

    if (!otpOrder) {
      return NextResponse.json({ success: false, message: 'Ticket OTP introuvable' }, { status: 404 });
    }

    if (otpOrder.tenantId !== sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const updated = await prisma.otpOrder.update({
      where: { id: otpOrder.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket OTP annulé avec succès',
      order: updated,
    });
  } catch (error: any) {
    console.error('Error cancelling reseller OTP ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
