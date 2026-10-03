import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { findOrderByCodeOrId } from '@/lib/orderHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Fetch bot settings (Token & Admin Chat ID)
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['telegram_bot_token', 'telegram_chat_id'],
        },
      },
    });

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value?.trim();
      return acc;
    }, {} as Record<string, string>);

    const botToken = settingsMap['telegram_bot_token'];
    const adminChatId = settingsMap['telegram_chat_id'];

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

    const answerCallbackQuery = async (callbackQueryId: string, text?: string, showAlert: boolean = false) => {
      if (!botToken) return;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text || '',
            show_alert: showAlert,
          }),
        });
      } catch (e) {
        console.error('Error answering callback query:', e);
      }
    };

    // Persistent Reply Keyboards (Keyboard Grid at bottom of phone screen)
    const getCustomerReplyKeyboard = () => ({
      keyboard: [
        [{ text: '🔍 Suivi de Ticket' }, { text: '📦 Catalogue' }],
        [{ text: '📱 Services SMS OTP' }, { text: '💬 Support & Aide' }],
        [{ text: '🌐 Site Web' }],
      ],
      resize_keyboard: true,
      persistent: true,
    });

    const getAdminReplyKeyboard = () => ({
      keyboard: [
        [{ text: '🔍 Suivi de Ticket' }, { text: '📦 Catalogue' }],
        [{ text: '📱 Services SMS OTP' }, { text: '💬 Support & Aide' }],
        [{ text: '📊 Statistiques Admin' }, { text: '🔐 Panneau Admin' }],
      ],
      resize_keyboard: true,
      persistent: true,
    });

    // Main Menu Component Generator
    const getMainMenu = (isAdmin: boolean) => {
      let text = `
<b>🤖 BOT OFFICIEL — ENTREPRENEURS POSITIFS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Bienvenue sur votre assistant automatique de revente d'abonnements & numéros virtuels !

<b>💡 Services & Fonctionnalités :</b>
• 🔍 <b>Suivi de Ticket :</b> Saisissez votre Code Ticket.
• 📦 <b>Catalogue Produits :</b> Consultez nos offres et abonnements.
• 📱 <b>Services SMS OTP :</b> Numéros virtuels pour SMS.
• 💬 <b>Support 24/7 :</b> Assistance client directe.
`.trim();

      if (isAdmin) {
        text += `\n• 📊 <b>Espace Admin :</b> Statistiques & validation 1-clic.`;
      }

      text += `\n\n👇 <i>Utilisez le menu au bas de votre écran ou saisissez votre code ticket :</i>`;

      const inlineKeyboard: { inline_keyboard: any[][] } = {
        inline_keyboard: [
          [
            { text: '🔍 Suivre un Ticket', callback_data: 'menu_suivi' },
            { text: '📦 Catalogue Produits', callback_data: 'menu_catalogue' },
          ],
          [
            { text: '📱 Services SMS OTP', callback_data: 'menu_otp' },
            { text: '💬 Support & Aide', callback_data: 'menu_support' },
          ],
        ],
      };

      if (isAdmin) {
        inlineKeyboard.inline_keyboard.push([
          { text: '📊 Statistiques Admin', callback_data: 'menu_stats' },
          { text: '🌐 Accéder au Site', url: 'https://revente-abonnement.vercel.app' },
        ]);
      } else {
        inlineKeyboard.inline_keyboard.push([
          { text: '🌐 Accéder au Site Web', url: 'https://revente-abonnement.vercel.app' },
        ]);
      }

      return { text, inlineKeyboard };
    };

    // 1. HANDLE INLINE BUTTON CALLBACK QUERY
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message?.chat?.id;
      const messageId = callbackQuery.message?.message_id;

      if (!chatId) return NextResponse.json({ success: true });
      const isAdmin = adminChatId ? String(chatId) === adminChatId : false;

      // Action A: Admin Order Validation / Cancellation (Restricted to Admin)
      if (callbackData && (callbackData.startsWith('val_') || callbackData.startsWith('can_'))) {
        if (!isAdmin) {
          await answerCallbackQuery(
            callbackQuery.id,
            "⚠️ Accès refusé : Seul l'administrateur peut exécuter cette action.",
            true
          );
          return NextResponse.json({ success: true, message: 'Non autorisé' });
        }

        await answerCallbackQuery(callbackQuery.id);

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

      await answerCallbackQuery(callbackQuery.id);

      // Menu Navigation Callbacks
      if (callbackData === 'menu_start') {
        const { text, inlineKeyboard } = getMainMenu(isAdmin);
        if (messageId) {
          await editTelegramMsg(chatId, messageId, text, inlineKeyboard);
        } else {
          await sendTelegramMsg(chatId, text, inlineKeyboard);
        }
        return NextResponse.json({ success: true });
      }

      if (callbackData === 'menu_suivi') {
        const text = `
<b>🔍 RECHERCHE & SUIVI DE TICKET</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour consulter l'état de votre commande et obtenir vos identifiants ou votre code SMS :

👉 Envoyez simplement votre <b>Code Ticket</b> dans ce chat (ex: <code>clx123456</code> ou <code>OTP-987654</code>).
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
        if (!isAdmin) {
          if (messageId) {
            await editTelegramMsg(
              chatId,
              messageId,
              `⚠️ <b>Accès restreint</b> : Cette section est réservée à l'administrateur.`,
              { inline_keyboard: [[{ text: '🔙 Retour au Menu', callback_data: 'menu_start' }]] }
            );
          }
          return NextResponse.json({ success: true });
        }

        const [totalProducts, totalOrders, completedOrders, totalOtpOrders, suppliersCount] = await Promise.all([
          prisma.product.count({ where: { isActive: true } }),
          prisma.order.count(),
          prisma.order.count({ where: { status: 'COMPLETED' } }),
          prisma.otpOrder.count(),
          prisma.supplier.count({ where: { isActive: true } }),
        ]);

        const text = `
<b>📊 STATISTIQUES GLOBALES (ADMIN)</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 📦 <b>Produits Actifs :</b> <code>${totalProducts}</code>
• 🛍️ <b>Commandes Totales :</b> <code>${totalOrders}</code>
• ✅ <b>Commandes Livrées :</b> <code>${completedOrders}</code>
• 📱 <b>Commandes OTP SMS :</b> <code>${totalOtpOrders}</code>
• 🔌 <b>Fournisseurs Connectés :</b> <code>${suppliersCount}</code>

<i>Données synchronisées en temps réel avec la base de données.</i>
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

    // 2. HANDLE INCOMING TEXT MESSAGES & BUTTON TAPS
    if (body.message && body.message.text) {
      const rawText = body.message.text.trim();
      const lowerText = rawText.toLowerCase();
      const chatId = body.message.chat.id;
      const isAdmin = adminChatId ? String(chatId) === adminChatId : false;
      const replyKeyboard = isAdmin ? getAdminReplyKeyboard() : getCustomerReplyKeyboard();

      // Case 1: Start / Menu / Help
      if (lowerText === '/start' || lowerText === '/help' || lowerText === '/menu' || lowerText.includes('menu')) {
        const { text, inlineKeyboard } = getMainMenu(isAdmin);
        const fullKeyboard = {
          inline_keyboard: inlineKeyboard.inline_keyboard,
          keyboard: replyKeyboard.keyboard,
          resize_keyboard: true,
          persistent: true,
        };
        await sendTelegramMsg(chatId, text, fullKeyboard);
        return NextResponse.json({ success: true });
      }

      // Case 2: Catalogue / Produits
      if (lowerText.includes('catalogue') || lowerText.includes('produit')) {
        const products = await prisma.product.findMany({
          where: { isActive: true },
          take: 8,
          orderBy: { title: 'asc' },
        });

        let text = `<b>📦 CATALOGUE DES PRODUITS POPULAIRES</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        products.forEach((p, idx) => {
          text += `${idx + 1}. <b>${p.title}</b>\n   💰 Prix : <code>$${p.sellingPrice.toFixed(2)} USD</code>\n   📂 Catégorie : ${p.category || 'Général'}\n\n`;
        });

        await sendTelegramMsg(chatId, text, replyKeyboard);
        return NextResponse.json({ success: true });
      }

      // Case 3: Services SMS OTP
      if (lowerText.includes('otp') || lowerText.includes('numéro') || lowerText.includes('sms')) {
        const text = `
<b>📱 SERVICES SMS OTP & NUMÉROS VIRTUELS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Obtenez un numéro temporaire pour valider vos comptes (WhatsApp, Telegram, OpenAI, Google, TikTok...).

Accédez directement à la section dédiée aux numéros virtuels pour générer votre SMS instantanément sur notre site.
`.trim();
        await sendTelegramMsg(chatId, text, replyKeyboard);
        return NextResponse.json({ success: true });
      }

      // Case 4: Support & Aide
      if (lowerText.includes('support') || lowerText.includes('aide') || lowerText.includes('contact')) {
        const text = `
<b>💬 SUPPORT CLIENT & ASSISTANCE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Besoin d'aide ? Vous pouvez nous contacter directement sur notre site ou suivre l'avancement de votre ticket en envoyant simplement le code ici.
`.trim();
        await sendTelegramMsg(chatId, text, replyKeyboard);
        return NextResponse.json({ success: true });
      }

      // Case 5: Site Web
      if (lowerText.includes('site web') || lowerText.includes('site')) {
        const text = `
<b>🌐 ACCÉDER À LA PLATEFORME WEB</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Retrouvez l'intégralité de nos abonnements, votre tableau de bord et le module OTP en ligne :

👉 https://revente-abonnement.vercel.app
`.trim();
        await sendTelegramMsg(chatId, text, replyKeyboard);
        return NextResponse.json({ success: true });
      }

      // Case 6: Admin Features (Stats / Panneau Admin)
      if (lowerText.includes('admin') || lowerText.includes('statistique') || lowerText.includes('stats')) {
        if (!isAdmin) {
          await sendTelegramMsg(
            chatId,
            `<b>⚠️ ACCÈS RESTREINT</b>\n\nCette section et ces commandes sont réservées exclusivement à l'administrateur du système.`,
            replyKeyboard
          );
          return NextResponse.json({ success: true });
        }

        const [totalProducts, totalOrders, completedOrders, totalOtpOrders, suppliersCount] = await Promise.all([
          prisma.product.count({ where: { isActive: true } }),
          prisma.order.count(),
          prisma.order.count({ where: { status: 'COMPLETED' } }),
          prisma.otpOrder.count(),
          prisma.supplier.count({ where: { isActive: true } }),
        ]);

        const text = `
<b>📊 TABLEAU DE BORD ADMIN</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 📦 <b>Produits Actifs :</b> <code>${totalProducts}</code>
• 🛍️ <b>Commandes Totales :</b> <code>${totalOrders}</code>
• ✅ <b>Commandes Livrées :</b> <code>${completedOrders}</code>
• 📱 <b>Commandes OTP SMS :</b> <code>${totalOtpOrders}</code>
• 🔌 <b>Fournisseurs Connectés :</b> <code>${suppliersCount}</code>

<i>Accès Administrateur validé.</i>
`.trim();
        await sendTelegramMsg(chatId, text, replyKeyboard);
        return NextResponse.json({ success: true });
      }

      // Case 7: Ticket Search by Code (e.g., /suivi TK-123 or raw code like clx123 or OTP-123)
      const candidateCode = rawText.replace(/^\/(ticket|suivi|order)\s*/i, '').trim();

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

          await sendTelegramMsg(chatId, responseText, replyKeyboard);
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

          await sendTelegramMsg(chatId, responseText, replyKeyboard);
          return NextResponse.json({ success: true, message: 'Suivi OTP envoyé.' });
        }

        // Only display "Ticket non trouvé" if candidate code looks like a ticket or was searched with /suivi or /ticket
        if (rawText.toLowerCase().startsWith('/ticket') || rawText.toLowerCase().startsWith('/suivi') || candidateCode.length >= 8) {
          await sendTelegramMsg(
            chatId,
            `⚠️ Aucun ticket trouvé avec le code <code>${candidateCode}</code>. Vérifiez votre code et réessayez.`,
            replyKeyboard
          );
          return NextResponse.json({ success: true, message: 'Ticket non trouvé.' });
        }
      }

      // Default fallback for unknown text: prompt with menu keyboard
      await sendTelegramMsg(
        chatId,
        `💡 Pour suivre une commande, envoyez votre <b>Code Ticket</b>.\nOu utilisez les boutons du clavier ci-dessous pour naviguer.`,
        replyKeyboard
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: 'Webhook Telegram traité.' });
  } catch (error: any) {
    console.error('Error handling Telegram Webhook:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
