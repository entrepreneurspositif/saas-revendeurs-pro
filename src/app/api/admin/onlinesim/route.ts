import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimBalance } from '@/lib/onlinesim';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const keySetting = await prisma.setting.findUnique({ where: { key: 'ONLINESIM_API_KEY' } });
    const userSetting = await prisma.setting.findUnique({ where: { key: 'ONLINESIM_USER_ID' } });
    const marginSetting = await prisma.setting.findUnique({ where: { key: 'ONLINESIM_MARGIN_PERCENT' } });

    // Seed defaults if missing
    const apiKey = keySetting?.value || 'D7b35U1V9w7fAUr-wh87r8Bj-8k17Le4u-jGg3HshL-XY7kS1faZRZ9gQW';
    const userId = userSetting?.value || '780784';
    const marginPercent = marginSetting ? parseFloat(marginSetting.value) : 30;

    if (!keySetting) {
      await prisma.setting.upsert({
        where: { key: 'ONLINESIM_API_KEY' },
        update: { value: apiKey },
        create: { key: 'ONLINESIM_API_KEY', value: apiKey },
      });
    }
    if (!userSetting) {
      await prisma.setting.upsert({
        where: { key: 'ONLINESIM_USER_ID' },
        update: { value: userId },
        create: { key: 'ONLINESIM_USER_ID', value: userId },
      });
    }
    if (!marginSetting) {
      await prisma.setting.upsert({
        where: { key: 'ONLINESIM_MARGIN_PERCENT' },
        update: { value: '30' },
        create: { key: 'ONLINESIM_MARGIN_PERCENT', value: '30' },
      });
    }

    const balanceRes = await getOnlineSimBalance(apiKey);

    return NextResponse.json({
      success: true,
      apiKey,
      userId,
      marginPercent,
      balance: balanceRes.balance,
      balanceMessage: balanceRes.message || null,
      balanceSuccess: balanceRes.success,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, userId, marginPercent } = body;

    if (apiKey !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'ONLINESIM_API_KEY' },
        update: { value: apiKey.trim() },
        create: { key: 'ONLINESIM_API_KEY', value: apiKey.trim() },
      });
    }

    if (userId !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'ONLINESIM_USER_ID' },
        update: { value: String(userId).trim() },
        create: { key: 'ONLINESIM_USER_ID', value: String(userId).trim() },
      });
    }

    if (marginPercent !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'ONLINESIM_MARGIN_PERCENT' },
        update: { value: String(marginPercent) },
        create: { key: 'ONLINESIM_MARGIN_PERCENT', value: String(marginPercent) },
      });
    }

    const currentKey = apiKey?.trim() || (await prisma.setting.findUnique({ where: { key: 'ONLINESIM_API_KEY' } }))?.value;
    const balanceRes = await getOnlineSimBalance(currentKey);

    return NextResponse.json({
      success: true,
      message: 'Paramètres OnlineSIM enregistrés avec succès !',
      balance: balanceRes.balance,
      balanceSuccess: balanceRes.success,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
