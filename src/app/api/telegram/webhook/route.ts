import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findOrderByCodeOrId } from '@/lib/orderHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if update is a Telegram Inline Keyboard callback query
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data; // e.g., 'val_TK-123456' or 'can_TK-123456'
      const chatId = callbackQuery.message?.chat?.id;
      const messageId = callbackQuery.message?.message_id;

      if (callbackData && (callbackData.startsWith('val_') || callbackData.startsWith('can_'))) {
        const isValidate = callbackData.startsWith('val_');
        const ticketCode = callbackData.replace(/^(val_|can_)/, '');

        let statusResultText = '';

        // Check if OTP Ticket
        if (ticketCode.toUpperCase().startsWith('OTP-')) {
          const otpOrder = await prisma.otpOrder.findFirst({
            where: {
              OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
            },
          });

          if (otpOrder) {
            if (isValidate) {
              await prisma.otpOrder.update({
                where: { id: otpOrder.id },
                data: { status: 'WAITING_SMS' },
              });
              statusResultText = `✅ Commande OTP ${otpOrder.ticketCode} (${otpOrder.service.toUpperCase()}) validée avec succès depuis Telegram !`;
            } else {
              await prisma.otpOrder.update({
                where: { id: otpOrder.id },
                data: { status: 'CANCELLED' },
              });
              statusResultText = `❌ Commande OTP ${otpOrder.ticketCode} annulée/refusée depuis Telegram.`;
            }
          } else {
            statusResultText = `⚠️ Ticket OTP ${ticketCode} introuvable.`;
          }
        } else {
          // Standard Product Order Ticket
          const order = await findOrderByCodeOrId(ticketCode);

          if (order) {
            if (isValidate) {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED' },
              });
              statusResultText = `✅ Commande ${order.ticketCode} (${order.productTitle}) validée et marquée livrée depuis Telegram !`;
            } else {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' },
              });
              statusResultText = `❌ Commande ${order.ticketCode} annulée/refusée depuis Telegram.`;
            }
          } else {
            statusResultText = `⚠️ Ticket ${ticketCode} introuvable.`;
          }
        }

        // Fetch Bot Token to answer Telegram Callback
        const botTokenSetting = await prisma.setting.findUnique({
          where: { key: 'telegram_bot_token' },
        });

        const botToken = botTokenSetting?.value?.trim();

        if (botToken) {
          // 1. Answer Callback Query to stop spinner in Telegram app
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: statusResultText,
            }),
          });

          // 2. Edit Telegram message to update status
          if (chatId && messageId) {
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: `${callbackQuery.message?.text}\n\n<b>📌 ACTION ADMIN :</b> ${statusResultText}`,
                parse_mode: 'HTML',
              }),
            });
          }
        }

        return NextResponse.json({ success: true, message: statusResultText });
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook Telegram reçu.' });
  } catch (error: any) {
    console.error('Error handling Telegram Webhook:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
