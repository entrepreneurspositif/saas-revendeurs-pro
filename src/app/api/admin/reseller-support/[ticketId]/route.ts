import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params;
    const ticket = await prisma.resellerTicket.findUnique({
      where: { id: ticketId },
      include: { tenant: true },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const { message, newStatus } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Le message est requis' }, { status: 400 });
    }

    // Create Super Admin message
    const newMessage = await prisma.resellerTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderRole: 'SUPER_ADMIN',
        senderName: 'Super Admin',
        message: message.trim(),
      },
    });

    // Update ticket status if provided or default to IN_PROGRESS if OPEN
    const updatedStatus = newStatus || (ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);
    const updatedTicket = await prisma.resellerTicket.update({
      where: { id: ticket.id },
      data: {
        status: updatedStatus,
        updatedAt: new Date(),
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            storeName: true,
            subdomain: true,
            planId: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Notify reseller on Telegram if enabled
    sendResellerTelegramNotification({
      tenantId: ticket.tenantId,
      eventType: 'SUPPORT_REPLY',
      title: `Réponse du Super Admin (${ticket.ticketCode})`,
      ticketCode: ticket.ticketCode,
      details: `Sujet : ${ticket.subject}\nRéponse :\n${message.trim().substring(0, 300)}`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: newMessage,
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Error replying as admin to reseller ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params;
    const body = await req.json();
    const { status, priority } = body;

    const data: any = { updatedAt: new Date() };
    if (status) data.status = status;
    if (priority) data.priority = priority;

    const updatedTicket = await prisma.resellerTicket.update({
      where: { id: ticketId },
      data,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            storeName: true,
            subdomain: true,
            planId: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Error updating reseller ticket status:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
