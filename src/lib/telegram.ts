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
