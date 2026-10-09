import { prisma } from '@/lib/prisma';

export interface TelegramNotificationParams {
  title: string;
  ticketCode?: string;
  orderId?: string;
  type: 'ORDER' | 'OTP' | 'SUPPORT' | 'REQUEST';
  details: string;
  amount?: string;
}

export async function sendTelegramNotification(params: TelegramNotificationParams) {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled'],
        },
      },
    });

    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const botToken = config['telegram_bot_token']?.trim();
    const chatId = config['telegram_chat_id']?.trim();
    const isEnabled = config['telegram_enabled'] === 'true';

    if (!isEnabled || !botToken || !chatId) {
      return { success: false, message: 'Notifications Telegram non configurées ou désactivées.' };
    }

    let emoji = '🔔';
    let typeLabel = 'ACTIVITÉ';

    switch (params.type) {
      case 'ORDER':
        emoji = '🎟️';
        typeLabel = 'NOUVELLE COMMANDE PRODUIT';
        break;
      case 'OTP':
        emoji = '📱';
        typeLabel = 'COMMANDE NUMÉRO OTP';
        break;
      case 'SUPPORT':
        emoji = '💬';
        typeLabel = 'MESSAGE SUPPORT CLIENT';
        break;
      case 'REQUEST':
        emoji = '✨';
        typeLabel = 'DEMANDE SUR-MESURE';
        break;
    }

    const messageText = `
<b>${emoji} ${typeLabel}</b>

<b>Titre :</b> ${params.title}
${params.ticketCode ? `<b>Code Ticket :</b> <code>${params.ticketCode}</code>` : ''}
${params.amount ? `<b>Montant :</b> ${params.amount}` : ''}

<b>Détails :</b>
${params.details}

📅 <i>${new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</i>
`.trim();

    const inlineKeyboard: any[] = [];

    // Add 1-tap action buttons if applicable
    if (params.ticketCode) {
      const actionRow = [];
      if (params.type === 'ORDER' || params.type === 'OTP') {
        actionRow.push({
          text: '✅ Valider & Lancer',
          callback_data: `val_${params.ticketCode}`,
        });
        actionRow.push({
          text: '❌ Refuser',
          callback_data: `can_${params.ticketCode}`,
        });
      }
      if (actionRow.length > 0) {
        inlineKeyboard.push(actionRow);
      }
    }

    const payload: any = {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'HTML',
    };

    if (inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { success: data.ok, data };
  } catch (error: any) {
    console.error('Error sending Telegram notification:', error);
    return { success: false, error: error.message };
  }
}

export interface ResellerTelegramNotificationParams {
  tenantId: string;
  type?: 'NEW_ORDER' | 'NEW_OTP' | 'SUPPORT_REPLY' | 'SUBSCRIPTION' | 'PAYOUT';
  eventType?: 'NEW_ORDER' | 'NEW_OTP' | 'SUPPORT_REPLY' | 'SUBSCRIPTION' | 'PAYOUT';
  title: string;
  ticketCode?: string;
  amount?: string;
  resellerProfit?: string;
  details?: string;
}

export async function sendResellerTelegramNotification(params: ResellerTelegramNotificationParams) {
  try {
    const eventType = params.eventType || params.type || 'NEW_ORDER';

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.tenantId },
      select: {
        id: true,
        name: true,
        storeName: true,
        subdomain: true,
        telegramBotToken: true,
        telegramChatId: true,
        telegramNotificationsEnabled: true,
        notifyOnNewOrder: true,
        notifyOnOtpOrder: true,
        notifyOnSupportReply: true,
        notifyOnPayout: true,
      },
    });

    if (!tenant || !tenant.telegramNotificationsEnabled || !tenant.telegramChatId) {
      return { success: false, message: 'Notifications Telegram non activées pour ce revendeur.' };
    }

    // Check specific event preferences
    if (eventType === 'NEW_ORDER' && tenant.notifyOnNewOrder === false) return { success: false, skipped: true };
    if (eventType === 'NEW_OTP' && tenant.notifyOnOtpOrder === false) return { success: false, skipped: true };
    if (eventType === 'SUPPORT_REPLY' && tenant.notifyOnSupportReply === false) return { success: false, skipped: true };
    if (eventType === 'PAYOUT' && tenant.notifyOnPayout === false) return { success: false, skipped: true };

    // Resolve Bot Token: Custom reseller token or platform fallback token
    let botToken = tenant.telegramBotToken?.trim();
    if (!botToken) {
      const platformBotTokenSetting = await prisma.setting.findUnique({
        where: { key: 'telegram_bot_token' },
      });
      botToken = platformBotTokenSetting?.value?.trim();
    }

    if (!botToken) {
      return { success: false, message: 'Aucun bot Telegram disponible pour expédier la notification.' };
    }

    let emoji = '🔔';
    let typeLabel = 'ACTIVITÉ BOUTIQUE';
    switch (eventType) {
      case 'NEW_ORDER':
        emoji = '🎉';
        typeLabel = 'NOUVELLE VENTE SUR VOTRE VITRINE';
        break;
      case 'NEW_OTP':
        emoji = '📱';
        typeLabel = 'NOUVELLE VENTE NUMÉRO OTP';
        break;
      case 'SUPPORT_REPLY':
        emoji = '💬';
        typeLabel = 'RÉPONSE DU SUPER ADMIN (SUPPORT)';
        break;
      case 'SUBSCRIPTION':
        emoji = '👑';
        typeLabel = 'OFFRE SAAS REVENDEUR';
        break;
      case 'PAYOUT':
        emoji = '💰';
        typeLabel = 'PORTEFEUILLE & COMMISSIONS';
        break;
    }

    const messageText = `
<b>${emoji} ${typeLabel}</b>
🏬 <b>Boutique :</b> ${tenant.storeName || tenant.name} (<code>/store/${tenant.subdomain}</code>)

<b>Titre :</b> ${params.title}
${params.ticketCode ? `<b>Code Ticket :</b> <code>${params.ticketCode}</code>\n` : ''}${params.amount ? `<b>Prix Vente Client :</b> ${params.amount}\n` : ''}${params.resellerProfit ? `<b>💎 Votre Bénéfice Net :</b> <code>${params.resellerProfit}</code>\n` : ''}
<b>Détails :</b>
${params.details}

📅 <i>${new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</i>
`.trim();

    const payload: any = {
      chat_id: tenant.telegramChatId.trim(),
      text: messageText,
      parse_mode: 'HTML',
    };

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { success: data.ok, data };
  } catch (error: any) {
    console.error('Error sending Reseller Telegram notification:', error);
    return { success: false, error: error.message };
  }
}

