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

    // Helper to edit existing Telegram message
    const editTelegramMsg = async (chatId: number | string, messageId: number, text: string, replyMarkup?: any) => {
      if (!botToken) return;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          }),
        });
      } catch (e) {
        console.error('Error editing telegram message:', e);
      }
    };

    const answerCallbackQuery = async (callbackQueryId: string, text?: string) => {
      if (!botToken) return;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text || '',
          }),
        });
      } catch (e) {
        console.error('Error answering callback query:', e);
      }
    };

    // Main Menu Component Generator
    const getMainMenu = () => {
      const text = `
<b>🤖 BOT OFFICIEL — ENTREPRENEURS POSITIFS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Bienvenue sur votre assistant automatique de revente d'abonnements & numéros virtuels !

<b>💡 Services & Fonctionnalités disponibles :</b>
• 🔍 <b>Suivi de Ticket :</b> Saisissez ou envoyez votre Code Ticket.
• 📦 <b>Catalogue Produits :</b> Consultez nos offres et abonnements.
• 📱 <b>Services SMS OTP :</b> Numéros virtuels pour vérifications.
• 📊 <b>Statistiques :</b> Vue d'ensemble de la plateforme.
• 💬 <b>Support 24/7 :</b> Assistance client et aide directes.

👇 <i>Sélectionnez une option ci-dessous ou tapez directement un code ticket :</i>
`.trim();

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔍 Suivre un Ticket', callback_data: 'menu_suivi' },
            { text: '📦 Catalogue Produits', callback_data: 'menu_catalogue' },
          ],
          [
            { text: '📱 Services SMS OTP', callback_data: 'menu_otp' },
            { text: '📊 Statistiques', callback_data: 'menu_stats' },
          ],
          [
            { text: '💬 Support & Aide', callback_data: 'menu_support' },
            { text: '🌐 Ouvrir le Site Web', url: 'https://revente-abonnement.vercel.app' },
          ],
        ],
      };

      return { text, keyboard };
    };

    // 1. HANDLE INLINE BUTTON CALLBACK QUERY
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message?.chat?.id;
      const messageId = callbackQuery.message?.message_id;

      await answerCallbackQuery(callbackQuery.id);

      if (!chatId) return NextResponse.json({ success: true });

      // Action A: Admin Order Validation / Cancellation (1-Click)
      if (callbackData && (callbackData.startsWith('val_') || callbackData.startsWith('can_'))) {
        const isValidate = callbackData.startsWith('val_');
        const ticketCode = callbackData.replace(/^(val_|can_)/, '').trim();

        let statusResultText = '';
        let deliveredCredentialsText = '';

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
              await prisma.order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED' },
              });
              statusResultText = `✅ Commande manuelle <code>${order.ticketCode}</code> (${order.productTitle}) validée et marquée comme livrée !`;
            }
          }
        }

        if (messageId) {
          let updatedText = `${callbackQuery.message?.text}\n\n<b>📌 ACTION ADMIN :</b> ${statusResultText}`;
          if (deliveredCredentialsText) {
            updatedText += `\n\n<b>🔑 CODES / IDENTIFIANTS LIVRÉS :</b>\n<code>${deliveredCredentialsText}</code>`;
          }
          await editTelegramMsg(chatId, messageId, updatedText);
        }

        return NextResponse.json({ success: true, message: statusResultText });
      }

      // Action B: Menu Navigation Callbacks
      if (callbackData === 'menu_start') {
        const { text, keyboard } = getMainMenu();
        if (messageId) {
          await editTelegramMsg(chatId, messageId, text, keyboard);
        } else {
          await sendTelegramMsg(chatId, text, keyboard);
        }
        return NextResponse.json({ success: true });
      }

      if (callbackData === 'menu_suivi') {
        const text = `
<b>🔍 RECHERCHE & SUIVI DE TICKET</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour consulter l'état de votre commande et obtenir vos identifiants ou votre code SMS :

👉 Envoyez simplement le <b>Code Ticket</b> dans ce chat (ex: <code>clx123456</code> ou <code>OTP-987654</code>).
👉 Ou tapez : <code>/suivi VOTRE_CODE</code>

<i>Vos informations s'afficheront instantanément dès que l'administrateur valide le paiement.</i>
`.trim();
        const keyboard = {
          inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]],
        };
        if (messageId) await editTelegramMsg(chatId, messageId, text, keyboard);
        else await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      if (callbackData === 'menu_catalogue') {
        const products = await prisma.product.findMany({
          where: { isActive: true },
          take: 8,
          orderBy: { title: 'asc' },
        });

        let text = `<b>📦 CATALOGUE DES PRODUITS POPULAIRES</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        if (products.length === 0) {
          text += `<i>Aucun produit disponible pour le moment.</i>`;
        } else {
          products.forEach((p, idx) => {
            text += `${idx + 1}. <b>${p.title}</b>\n   💰 Prix : <code>$${p.sellingPrice.toFixed(2)} USD</code>\n   📂 Catégorie : ${p.category || 'Général'}\n\n`;
          });
          text += `🌐 <i>Consultez tous nos abonnements en stock sur notre site web.</i>`;
        }

        const keyboard = {
          inline_keyboard: [
            [{ text: '🌐 Voir tous les produits sur le site', url: 'https://revente-abonnement.vercel.app' }],
            [{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }],
          ],
        };
        if (messageId) await editTelegramMsg(chatId, messageId, text, keyboard);
        else await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      if (callbackData === 'menu_otp') {
        const text = `
<b>📱 SERVICES DE NUMÉROS VIRTUELS (SMS OTP)</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Obtenez des numéros virtuels temporaires pour la vérification SMS de vos comptes :

• 🟢 <b>WhatsApp & Telegram</b>
• 🤖 <b>OpenAI / ChatGPT</b>
• 🔵 <b>Google & YouTube</b>
• 🎵 <b>TikTok & Instagram</b>
• 🎬 <b>Netflix, Spotify, & Plus</b>

👉 Tapez <code>/otp</code> pour voir les tarifs ou commander directement vos numéros sur la plateforme web.
`.trim();
        const keyboard = {
          inline_keyboard: [
            [{ text: '📱 Accéder à la page OTP', url: 'https://revente-abonnement.vercel.app/otp' }],
            [{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }],
          ],
        };
        if (messageId) await editTelegramMsg(chatId, messageId, text, keyboard);
        else await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      if (callbackData === 'menu_stats') {
        const [totalProducts, totalOrders, completedOrders, totalOtpOrders, suppliersCount] = await Promise.all([
          prisma.product.count({ where: { isActive: true } }),
          prisma.order.count(),
          prisma.order.count({ where: { status: 'COMPLETED' } }),
          prisma.otpOrder.count(),
          prisma.supplier.count({ where: { isActive: true } }),
        ]);

        const text = `
<b>📊 STATISTIQUES GLOBALES DE LA PLATEFORME</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 📦 <b>Produits Actifs :</b> <code>${totalProducts}</code>
• 🛍️ <b>Commandes Totales :</b> <code>${totalOrders}</code>
• ✅ <b>Commandes Livrées :</b> <code>${completedOrders}</code>
• 📱 <b>Commandes OTP SMS :</b> <code>${totalOtpOrders}</code>
• 🔌 <b>Fournisseurs Connectés :</b> <code>${suppliersCount}</code>

<i>Ces données sont synchronisées en temps réel avec la base de données.</i>
`.trim();
        const keyboard = {
          inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]],
        };
        if (messageId) await editTelegramMsg(chatId, messageId, text, keyboard);
        else await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      if (callbackData === 'menu_support') {
        const text = `
<b>💬 SUPPORT CLIENT & ASSISTANCE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Besoin d'aide avec une commande ou une relecture de ticket ?

• 🌐 <b>Centre d'aide sur le site :</b> Support par ticket en ligne
• ⚡ <b>Temps de réponse moyen :</b> Moins de 15 minutes

<i>N'hésitez pas à nous envoyer vos questions ou votre code ticket à tout moment !</i>
`.trim();
        const keyboard = {
          inline_keyboard: [
            [{ text: '💬 Accéder au Support Web', url: 'https://revente-abonnement.vercel.app' }],
            [{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }],
          ],
        };
        if (messageId) await editTelegramMsg(chatId, messageId, text, keyboard);
        else await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }
    }

    // 2. HANDLE INCOMING TEXT MESSAGES & COMMANDS
    if (body.message && body.message.text) {
      const userMessage = body.message.text.trim();
      const chatId = body.message.chat.id;

      // Command: /start, /help, /menu
      if (userMessage === '/start' || userMessage === '/help' || userMessage === '/menu') {
        const { text, keyboard } = getMainMenu();
        await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      // Command: /catalogue or /produits
      if (userMessage.startsWith('/catalogue') || userMessage.startsWith('/produits')) {
        const products = await prisma.product.findMany({
          where: { isActive: true },
          take: 8,
          orderBy: { title: 'asc' },
        });

        let text = `<b>📦 CATALOGUE DES PRODUITS POPULAIRES</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        products.forEach((p, idx) => {
          text += `${idx + 1}. <b>${p.title}</b>\n   💰 Prix : <code>$${p.sellingPrice.toFixed(2)} USD</code>\n   📂 Catégorie : ${p.category || 'Général'}\n\n`;
        });

        const keyboard = {
          inline_keyboard: [
            [{ text: '🌐 Voir tous les produits sur le site', url: 'https://revente-abonnement.vercel.app' }],
            [{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }],
          ],
        };
        await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      // Command: /otp
      if (userMessage.startsWith('/otp')) {
        const text = `
<b>📱 SERVICES SMS OTP & NUMÉROS VIRTUELS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Obtenez un numéro temporaire pour valider n'importe quel service (WhatsApp, Telegram, OpenAI, Google...).

Accédez directement à la section dédiée aux numéros virtuels pour générer votre SMS instantanément.
`.trim();
        const keyboard = {
          inline_keyboard: [
            [{ text: '📱 Aller sur le module OTP', url: 'https://revente-abonnement.vercel.app/otp' }],
            [{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }],
          ],
        };
        await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      // Command: /stats or /admin
      if (userMessage.startsWith('/stats') || userMessage.startsWith('/admin')) {
        const [totalProducts, totalOrders, completedOrders, totalOtpOrders, suppliersCount] = await Promise.all([
          prisma.product.count({ where: { isActive: true } }),
          prisma.order.count(),
          prisma.order.count({ where: { status: 'COMPLETED' } }),
          prisma.otpOrder.count(),
          prisma.supplier.count({ where: { isActive: true } }),
        ]);

        const text = `
<b>📊 STATISTIQUES GLOBALES DE LA PLATEFORME</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 📦 <b>Produits Actifs :</b> <code>${totalProducts}</code>
• 🛍️ <b>Commandes Totales :</b> <code>${totalOrders}</code>
• ✅ <b>Commandes Livrées :</b> <code>${completedOrders}</code>
• 📱 <b>Commandes OTP SMS :</b> <code>${totalOtpOrders}</code>
• 🔌 <b>Fournisseurs Connectés :</b> <code>${suppliersCount}</code>
`.trim();
        const keyboard = {
          inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]],
        };
        await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      // Command: /support or /contact
      if (userMessage.startsWith('/support') || userMessage.startsWith('/contact')) {
        const text = `
<b>💬 SUPPORT CLIENT & ASSISTANCE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Besoin d'aide ? Vous pouvez nous contacter directement sur notre site ou suivre l'avancement de votre ticket en envoyant simplement le code ici.
`.trim();
        const keyboard = {
          inline_keyboard: [
            [{ text: '🌐 Ouvrir le Site Web', url: 'https://revente-abonnement.vercel.app' }],
            [{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }],
          ],
        };
        await sendTelegramMsg(chatId, text, keyboard);
        return NextResponse.json({ success: true });
      }

      // 3. TICKET SEARCH BY CODE (/suivi CODE or raw CODE text)
      const candidateCode = userMessage.replace(/^\/(ticket|suivi|order)\s*/i, '').trim();

      if (candidateCode.length >= 3) {
        // Search product order
        const order = await findOrderByCodeOrId(candidateCode, true);

        if (order) {
          let statusBadge = '⏳ EN ATTENTE DE PAIEMENT';
          if (order.status === 'COMPLETED') statusBadge = '🟢 LIVRÉ & PAYÉ';
          if (order.status === 'CANCELLED') statusBadge = '🔴 ANNULÉ / REFUSÉ';

          let responseText = `
<b>🎟️ SUIVI DU TICKET DE COMMANDE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
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

          const keyboard = {
            inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]],
          };
          await sendTelegramMsg(chatId, responseText, keyboard);
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
━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>Service :</b> ${otpOrder.service.toUpperCase()} (${otpOrder.country})
<b>Code Ticket :</b> <code>${otpOrder.ticketCode}</code>
<b>Téléphone :</b> <code>${otpOrder.phone || 'Génération en cours'}</code>
<b>Statut :</b> ${otpStatus}
<b>Date :</b> 📅 <i>${new Date(otpOrder.createdAt).toLocaleString('fr-FR')}</i>
`.trim();

          if (otpOrder.smsCode || otpOrder.fullSms) {
            responseText += `\n\n<b>💬 CODE SMS REÇU :</b>\n<code>${otpOrder.smsCode || otpOrder.fullSms}</code>`;
          }

          const keyboard = {
            inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]],
          };
          await sendTelegramMsg(chatId, responseText, keyboard);
          return NextResponse.json({ success: true, message: 'Suivi OTP envoyé.' });
        }

        // If code searched specifically with /suivi or /ticket but not found
        if (userMessage.toLowerCase().startsWith('/ticket') || userMessage.toLowerCase().startsWith('/suivi') || candidateCode.length >= 8) {
          const keyboard = {
            inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]],
          };
          await sendTelegramMsg(
            chatId,
            `⚠️ Aucun ticket trouvé avec le code <code>${candidateCode}</code>. Vérifiez votre code et réessayez.`,
            keyboard
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
