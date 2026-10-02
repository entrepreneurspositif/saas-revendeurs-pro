import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimConfig } from '@/lib/onlinesim';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode, action } = body; // action: 'revise' or 'finish'

    if (!ticketCode) {
      return NextResponse.json(
        { success: false, message: 'Le code de ticket est requis' },
        { status: 400 }
      );
    }

    const otpOrder = await prisma.otpOrder.findFirst({
      where: {
        OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
      },
    });

    if (!otpOrder) {
      return NextResponse.json(
        { success: false, message: 'Commande OTP non trouvée' },
        { status: 404 }
      );
    }

    const { apiKey } = await getOnlineSimConfig();

    if (apiKey) {
      const endpoint = action === 'finish' ? 'setOperationOk.php' : 'setOperationRevise.php';
      const url = `https://onlinesim.io/api/${endpoint}?apikey=${apiKey}&tzid=${otpOrder.tzid}`;
      await fetch(url, { cache: 'no-store' });
    }

    const newStatus = action === 'finish' ? 'COMPLETED' : 'WAITING_SMS';
    const updatedOrder = await prisma.otpOrder.update({
      where: { id: otpOrder.id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
