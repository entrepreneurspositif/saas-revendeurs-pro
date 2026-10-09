import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const { ticketId } = params;
    const ticket = await prisma.resellerTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket introuvable' }, { status: 404 });
    }

    if (ticket.tenantId !== tenant.id) {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Le message est requis' }, { status: 400 });
    }

    // Add message
    const newMessage = await prisma.resellerTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderRole: 'RESELLER',
        senderName: tenant.storeName || tenant.name || 'Revendeur',
        message: message.trim(),
      },
    });

    // Update ticket updatedAt and reopen if it was marked resolved or closed
    const newStatus = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'OPEN' : ticket.status;
    await prisma.resellerTicket.update({
      where: { id: ticket.id },
      data: {
        updatedAt: new Date(),
        status: newStatus,
      },
    });

    // Notify Super Admin
    sendTelegramNotification({
      title: `Réponse Ticket Revendeur (${ticket.ticketCode})`,
      ticketCode: ticket.ticketCode,
      type: 'SUPPORT',
      details: `Revendeur : ${tenant.name} (${tenant.storeName || tenant.subdomain})\nMessage :\n${message.trim().substring(0, 300)}`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error('Error replying to reseller ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
