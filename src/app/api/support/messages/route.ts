import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findOrderByCodeOrId } from '@/lib/orderHelper';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTicketCode = searchParams.get('ticketCode')?.trim();
    const isAdmin = searchParams.get('admin') === 'true';

    // Admin requesting list of active support chat conversations
    // Only return orders that actually have at least 1 message sent
    if (isAdmin && !rawTicketCode) {
      const activeConversations = await prisma.order.findMany({
        where: {
          messages: {
            some: {},
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        conversations: activeConversations.map((order) => ({
          ticketCode: order.ticketCode,
          productTitle: order.productTitle,
          status: order.status,
          supportStatus: order.supportStatus || 'OPEN',
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          lastMessage: order.messages[0] || null,
          messageCount: order.messages.length,
        })),
      });
    }

    if (!rawTicketCode) {
      return NextResponse.json(
        { success: false, error: 'Code de ticket requis' },
        { status: 400 }
      );
    }

    const order = await findOrderByCodeOrId(rawTicketCode);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { ticketCode: order.ticketCode },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      order: {
        ticketCode: order.ticketCode,
        productTitle: order.productTitle,
        status: order.status,
        supportStatus: order.supportStatus || 'OPEN',
        quantity: order.quantity,
        createdAt: order.createdAt,
      },
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketCode: rawTicketCode, text, sender, action } = body;

    if (!rawTicketCode) {
      return NextResponse.json(
        { success: false, error: 'Code de ticket requis' },
        { status: 400 }
      );
    }

    // Verify order exists using resilient helper
    const order = await findOrderByCodeOrId(rawTicketCode);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Code de ticket invalide' },
        { status: 404 }
      );
    }

    // Handle Closing / Reopening Ticket Action
    if (action === 'close' || action === 'reopen' || action === 'toggleStatus') {
      const newSupportStatus = action === 'close' ? 'RESOLVED' : action === 'reopen' ? 'OPEN' : order.supportStatus === 'RESOLVED' ? 'OPEN' : 'RESOLVED';

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { supportStatus: newSupportStatus },
      });

      const systemText = newSupportStatus === 'RESOLVED'
        ? '✅ Ticket marqué comme résolu par l\'administrateur.'
        : '🔓 Ticket réouvert.';

      const systemMessage = await prisma.chatMessage.create({
        data: {
          ticketCode: order.ticketCode,
          sender: 'ADMIN',
          text: systemText,
        },
      });

      return NextResponse.json({
        success: true,
        supportStatus: updatedOrder.supportStatus,
        message: systemMessage,
      });
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message requis' },
        { status: 400 }
      );
    }

    const cleanSender = sender === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    // If customer sends a message to a resolved ticket, automatically reopen it
    if (cleanSender === 'CUSTOMER' && order.supportStatus === 'RESOLVED') {
      await prisma.order.update({
        where: { id: order.id },
        data: { supportStatus: 'OPEN' },
      });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        ticketCode: order.ticketCode, // Canonical ticket code
        sender: cleanSender,
        text: text.trim(),
      },
    });

    if (cleanSender === 'CUSTOMER') {
      sendTelegramNotification({
        title: `Message Support : ${order.productTitle}`,
        ticketCode: order.ticketCode,
        type: 'SUPPORT',
        details: text.trim(),
      }).catch((err) => console.error('Telegram Support notification error:', err));
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      supportStatus: cleanSender === 'CUSTOMER' && order.supportStatus === 'RESOLVED' ? 'OPEN' : order.supportStatus,
    });
  } catch (error: any) {
    console.error('Error sending support message or updating ticket status:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement de la requête support' },
      { status: 500 }
    );
  }
}
