import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled'],
        },
      },
    });

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      telegram: {
        botToken: settingsMap['telegram_bot_token'] || '',
        chatId: settingsMap['telegram_chat_id'] || '',
        enabled: settingsMap['telegram_enabled'] === 'true',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botToken, chatId, enabled, action } = body;

    // Handle Test Notification
    if (action === 'test') {
      const result = await sendTelegramNotification({
        title: 'Test de Notification Telegram',
        type: 'ORDER',
        ticketCode: 'TEST-123456',
        amount: '$10.00 USD',
        details: 'Félicitations ! Le bot Telegram d\'Entrepreneurs Positifs est configuré avec succès et fonctionne parfaitement.',
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Notification de test envoyée sur votre Telegram avec succès !',
        });
      } else {
        return NextResponse.json({
          success: false,
          message: result.message || 'Impossible d\'envoyer la notification Telegram. Vérifiez le Token et l\'ID Chat.',
        }, { status: 400 });
      }
    }

    const updates = [
      { key: 'telegram_bot_token', value: String(botToken || '').trim() },
      { key: 'telegram_chat_id', value: String(chatId || '').trim() },
      { key: 'telegram_enabled', value: enabled ? 'true' : 'false' },
    ];

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration Telegram enregistrée avec succès.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
