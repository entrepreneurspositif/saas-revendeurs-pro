import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        telegramBotToken: true,
        telegramChatId: true,
        telegramNotificationsEnabled: true,
        notifyOnNewOrder: true,
        notifyOnOtpOrder: true,
        notifyOnSupportReply: true,
        notifyOnPayout: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    // Also get platform bot username if available
    let platformBotUsername = '';
    const platformBotTokenSetting = await prisma.setting.findUnique({
      where: { key: 'telegram_bot_token' },
    });
    if (platformBotTokenSetting?.value) {
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${platformBotTokenSetting.value.trim()}/getMe`, {
          signal: AbortSignal.timeout(3000),
        });
        const meData = await meRes.json();
        if (meData.ok && meData.result?.username) {
          platformBotUsername = meData.result.username;
        }
      } catch (e) {
        // ignore network error / timeout
      }
    }

    return NextResponse.json({
      success: true,
      telegram: {
        botToken: tenant.telegramBotToken || '',
        chatId: tenant.telegramChatId || '',
        enabled: Boolean(tenant.telegramNotificationsEnabled),
        notifyOnNewOrder: tenant.notifyOnNewOrder !== false,
        notifyOnOtpOrder: tenant.notifyOnOtpOrder !== false,
        notifyOnSupportReply: tenant.notifyOnSupportReply !== false,
        notifyOnPayout: tenant.notifyOnPayout !== false,
        platformBotUsername,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reseller telegram config:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const {
      botToken,
      chatId,
      enabled,
      notifyOnNewOrder = true,
      notifyOnOtpOrder = true,
      notifyOnSupportReply = true,
      notifyOnPayout = true,
    } = body;

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        telegramBotToken: botToken ? String(botToken).trim() : null,
        telegramChatId: chatId ? String(chatId).trim() : null,
        telegramNotificationsEnabled: Boolean(enabled),
        notifyOnNewOrder: Boolean(notifyOnNewOrder),
        notifyOnOtpOrder: Boolean(notifyOnOtpOrder),
        notifyOnSupportReply: Boolean(notifyOnSupportReply),
        notifyOnPayout: Boolean(notifyOnPayout),
      },
      select: {
        telegramBotToken: true,
        telegramChatId: true,
        telegramNotificationsEnabled: true,
        notifyOnNewOrder: true,
        notifyOnOtpOrder: true,
        notifyOnSupportReply: true,
        notifyOnPayout: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres de notifications Telegram mis à jour avec succès !',
      telegram: {
        botToken: updatedTenant.telegramBotToken || '',
        chatId: updatedTenant.telegramChatId || '',
        enabled: Boolean(updatedTenant.telegramNotificationsEnabled),
        notifyOnNewOrder: updatedTenant.notifyOnNewOrder,
        notifyOnOtpOrder: updatedTenant.notifyOnOtpOrder,
        notifyOnSupportReply: updatedTenant.notifyOnSupportReply,
        notifyOnPayout: updatedTenant.notifyOnPayout,
      },
    });
  } catch (error: any) {
    console.error('Error updating reseller telegram settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const chatIdToTest = body.chatId ? String(body.chatId).trim() : tenant.telegramChatId;
    const botTokenToTest = body.botToken !== undefined ? String(body.botToken).trim() : tenant.telegramBotToken;

    if (!chatIdToTest) {
      return NextResponse.json(
        { success: false, message: 'Veuillez renseigner votre Chat ID Telegram avant d\'effectuer un test.' },
        { status: 400 }
      );
    }

    // Resolve bot token
    let botToken = botTokenToTest;
    if (!botToken) {
      const platformBotTokenSetting = await prisma.setting.findUnique({
        where: { key: 'telegram_bot_token' },
      });
      botToken = platformBotTokenSetting?.value?.trim() || null;
    }

    if (!botToken) {
      return NextResponse.json(
        { success: false, message: 'Aucun bot Telegram configuré. Veuillez saisir un Bot Token ou contacter le Super Admin.' },
        { status: 400 }
      );
    }

    const testMessage = `
<b>🚀 Test de Notification Telegram Réussi !</b>
🏬 <b>Boutique :</b> ${tenant.storeName || tenant.name} (<code>/store/${tenant.subdomain}</code>)

Félicitations ! Votre compte Telegram est parfaitement configuré pour recevoir vos alertes en temps réel :
• Nouvelles commandes & ventes sur votre vitrine
• Commissions créditées sur votre portefeuille
• Réponses du Super Admin sur vos tickets de support

📅 <i>${new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</i>
`.trim();

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatIdToTest,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      let errorMsg = data.description || 'Erreur Telegram inconnue';
      if (errorMsg.includes('chat not found')) {
        errorMsg = 'Chat ID introuvable. Avez-vous envoyé un premier message (/start) au bot avant de tester ?';
      }
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message de test envoyé avec succès sur votre compte Telegram ! Vérifiez votre application.',
    });
  } catch (error: any) {
    console.error('Error testing reseller telegram:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
