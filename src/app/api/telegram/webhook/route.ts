import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { findOrderByCodeOrId } from '@/lib/orderHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Fetch bot token for Telegram API responses
    const botTokenSetting = await prisma.setting.findUnique({
      where: { key: 'telegram_bot_token' },
    });
    const botToken = botTokenSetting?.value?.trim();

    // Helper to send Telegram message
    const sendTelegramMsg = async (chatId: number | string, text: string, replyMarkup?: any) => {
      if (!botToken) return;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          }),
        });
      } catch (e) {
        console.error('Error sending telegram message:', e);
      }
    };

    // 1. HANDLE INLINE BUTTON CALLBACK QUERY (1-Click Admin Validation/Cancel)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data; // e.g. 'val_TK-123456' or 'can_TK-123456'
      const chatId = callbackQuery.message?.chat?.id;
      const messageId = callbackQuery.message?.message_id;

      if (callbackData && (callbackData.startsWith('val_') || callbackData.startsWith('can_'))) {
        const isValidate = callbackData.startsWith('val_');
        const ticketCode = callbackData.replace(/^(val_|can_)/, '').trim();

        let statusResultText = '';
        let deliveredCredentialsText = '';

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
              statusResultText = `✅ Commande OTP <code>${otpOrder.ticketCode}</code> (${otpOrder.service.toUpperCase()}) validée avec succès ! En attente de SMS...`;
            } else {
              await prisma.otpOrder.update({
                where: { id: otpOrder.id },
                data: { status: 'CANCELLED' },
              });
              statusResultText = `❌ Commande OTP <code>${otpOrder.ticketCode}</code> refusée/annulée.`;
            }
          } else {
            statusResultText = `⚠️ Ticket OTP <code>${ticketCode}</code> introuvable.`;
          }
        } else {
          // Standard Product Order
          const order = await prisma.order.findFirst({
            where: {
              OR: [{ ticketCode }, { id: ticketCode }],
            },
            include: {
              product: {
                include: {
                  activeSupplierProduct: {
                    include: { supplier: true },
                  },
                },
              },
            },
          });

          if (!order) {
            statusResultText = `⚠️ Ticket <code>${ticketCode}</code> introuvable.`;
          } else if (order.status === 'COMPLETED') {
            statusResultText = `ℹ️ La commande <code>${order.ticketCode}</code> a déjà été validée et livrée.`;
            deliveredCredentialsText = order.deliveredCredentials || '';
          } else if (!isValidate) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'CANCELLED' },
            });
            statusResultText = `❌ Commande <code>${order.ticketCode}</code> (${order.productTitle}) annulée/refusée par l'administrateur.`;
          } else {
            // Validate & execute supplier purchase
            const suppProd = order.product?.activeSupplierProduct;
            if (suppProd && suppProd.supplier) {
              const supplier = suppProd.supplier;
              const driver = createSupplierDriver(supplier);

              const purchaseRes = await driver.purchase({
                productId: suppProd.externalId,
                quantity: order.quantity,
                idempotencyKey: order.idempotencyKey || `ord-${Date.now()}`,
              });

              if (!purchaseRes.success) {
                await prisma.order.update({
                  where: { id: order.id },
                  data: { errorMessage: purchaseRes.message },
                });
                statusResultText = `⚠️ Échec d'achat chez le fournisseur ${supplier.name} : ${purchaseRes.message}`;
              } else {
                const creds = typeof purchaseRes.deliveredCredentials === 'object'
                  ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
                  : String(purchaseRes.deliveredCredentials || 'Livré avec succès');

                await prisma.order.update({
                  where: { id: order.id },
                  data: {
                    status: 'COMPLETED',
                    deliveredCredentials: creds,
                    supplierOrderRef: purchaseRes.orderRef,
                  },
                });

                // Update stock
                await prisma.supplierProduct.update({
                  where: { id: suppProd.id },
                  data: {
                    stock: { decrement: order.quantity },
                    sold: { increment: order.quantity },
                  },
                });

                deliveredCredentialsText = creds;
                statusResultText = `✅ Commande <code>${order.ticketCode}</code> (${order.productTitle}) exécutée avec succès auprès de ${supplier.name} !`;
              }
            } else {
              // Manual product without supplier API
              await prisma.order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED' },
              });
              statusResultText = `✅ Commande manuelle <code>${order.ticketCode}</code> (${order.productTitle}) validée et marquée comme livrée !`;
            }
          }
        }

        // Answer Telegram Callback Spinner
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: statusResultText.replace(/<[^>]*>/g, ''),
            }),
          });

          // Edit Original Telegram Message
          if (chatId && messageId) {
            let updatedText = `${callbackQuery.message?.text}\n\n<b>📌 ACTION ADMIN :</b> ${statusResultText}`;
            if (deliveredCredentialsText) {
              updatedText += `\n\n<b>🔑 CODES / IDENTIFIANTS LIVRÉS :</b>\n<code>${deliveredCredentialsText}</code>`;
            }

            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: updatedText,
                parse_mode: 'HTML',
              }),
            });
          }
        }

        return NextResponse.json({ success: true, message: statusResultText });
      }
    }

    // 2. HANDLE INCOMING TEXT MESSAGES (Customer Order Tracking / Suivi de Ticket)
    if (body.message && body.message.text) {
      const userMessage = body.message.text.trim();
      const chatId = body.message.chat.id;

      if (userMessage === '/start' || userMessage === '/help') {
        const welcomeText = `
<b>🤖 Bot Officiel de Suivi de Commande & Support</b>

Bienvenue ! Vous pouvez consulter l'état de votre commande et récupérer vos identifiants ou codes de livraison en envoyant simplement votre <b>Code de Ticket</b>.

<b>Exemples de recherche :</b>
• Envoyez : <code>clx123456</code>
• Ou tapez : <code>/ticket clx123456</code>

<i>Dès la validation de votre paiement par l'administrateur, vos identifiants et codes de livraison s'afficheront immédiatement ici.</i>
`.trim();
        await sendTelegramMsg(chatId, welcomeText);
        return NextResponse.json({ success: true, message: 'Message de bienvenue envoyé.' });
      }

      // Extract ticket code from message (e.g. "/ticket CODE" or just "CODE")
      const candidateCode = userMessage.replace(/^\/(ticket|suivi|order)\s*/i, '').trim();

      if (candidateCode.length >= 3) {
        // Search standard product order first
        const order = await findOrderByCodeOrId(candidateCode, true);

        if (order) {
          let statusBadge = '⏳ EN ATTENTE DE PAIEMENT';
          if (order.status === 'COMPLETED') statusBadge = '🟢 LIVRÉ & PAYÉ';
          if (order.status === 'CANCELLED') statusBadge = '🔴 ANNULÉ / REFUSÉ';

          let responseText = `
<b>🎟️ SUIVI DU TICKET DE COMMANDE</b>

<b>Produit :</b> ${order.productTitle}
<b>Code Ticket :</b> <code>${order.ticketCode}</code>
<b>Montant :</b> $${order.totalAmount.toFixed(2)} USD
<b>Statut :</b> ${statusBadge}
<b>Date :</b> 📅 <i>${new Date(order.createdAt).toLocaleString('fr-FR')}</i>
`.trim();

          if (order.status === 'COMPLETED' && order.deliveredCredentials) {
            responseText += `\n\n<b>🔑 VOS IDENTIFIANTS / CODES LIVRÉS :</b>\n<code>${order.deliveredCredentials}</code>`;
          } else if (order.status === 'PENDING_PAYMENT') {
            responseText += `\n\n<b>💳 INSTRUCTIONS DE PAIEMENT :</b>\n${order.paymentInstructions || 'Veuillez effectuer votre règlement pour valider le ticket.'}`;
          }

          await sendTelegramMsg(chatId, responseText);
          return NextResponse.json({ success: true, message: 'Suivi de ticket envoyé.' });
        }

        // Search OTP order
        const otpOrder = await prisma.otpOrder.findFirst({
          where: {
            OR: [{ ticketCode: candidateCode.toUpperCase() }, { id: candidateCode }],
          },
        });

        if (otpOrder) {
          let otpStatus = '⏳ EN ATTENTE';
          if (otpOrder.status === 'WAITING_SMS') otpStatus = '📲 SMS EN ATTENTE';
          if (otpOrder.status === 'COMPLETED') otpStatus = '🟢 SMS REÇU & LIVRÉ';
          if (otpOrder.status === 'CANCELLED') otpStatus = '🔴 ANNULÉ';

          let responseText = `
<b>📱 SUIVI DU TICKET OTP</b>

<b>Service :</b> ${otpOrder.service.toUpperCase()} (${otpOrder.country})
<b>Code Ticket :</b> <code>${otpOrder.ticketCode}</code>
<b>Téléphone :</b> <code>${otpOrder.phone || 'Génération en cours'}</code>
<b>Statut :</b> ${otpStatus}
<b>Date :</b> 📅 <i>${new Date(otpOrder.createdAt).toLocaleString('fr-FR')}</i>
`.trim();

          if (otpOrder.smsCode || otpOrder.fullSms) {
            responseText += `\n\n<b>💬 CODE SMS REÇU :</b>\n<code>${otpOrder.smsCode || otpOrder.fullSms}</code>`;
          }

          await sendTelegramMsg(chatId, responseText);
          return NextResponse.json({ success: true, message: 'Suivi OTP envoyé.' });
        }

        // If code searched specifically with /ticket but not found
        if (userMessage.toLowerCase().startsWith('/ticket') || candidateCode.length >= 8) {
          await sendTelegramMsg(
            chatId,
            `⚠️ Aucun ticket trouvé avec le code <code>${candidateCode}</code>. Vérifiez votre code et réessayez.`
          );
          return NextResponse.json({ success: true, message: 'Ticket non trouvé.' });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook Telegram traité.' });
  } catch (error: any) {
    console.error('Error handling Telegram Webhook:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
