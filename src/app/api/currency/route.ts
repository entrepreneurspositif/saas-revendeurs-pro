import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rateSetting = await prisma.setting.findUnique({
      where: { key: 'FCFA_RATE' },
    });

    const currencySetting = await prisma.setting.findUnique({
      where: { key: 'DEFAULT_CURRENCY' },
    });

    const fcfaRate = rateSetting ? parseFloat(rateSetting.value) || 650 : 650;
    const defaultCurrency = currencySetting?.value || 'FCFA';

    return NextResponse.json({
      success: true,
      fcfaRate,
      defaultCurrency,
    });
  } catch (error: any) {
    console.error('Error fetching currency settings:', error);
    return NextResponse.json(
      { success: false, fcfaRate: 650, defaultCurrency: 'FCFA' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fcfaRate, defaultCurrency } = body;

    if (fcfaRate !== undefined) {
      const parsedRate = parseFloat(fcfaRate);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        await prisma.setting.upsert({
          where: { key: 'FCFA_RATE' },
          update: { value: parsedRate.toString() },
          create: { key: 'FCFA_RATE', value: parsedRate.toString() },
        });
      }
    }

    if (defaultCurrency && ['FCFA', 'USD'].includes(defaultCurrency)) {
      await prisma.setting.upsert({
        where: { key: 'DEFAULT_CURRENCY' },
        update: { value: defaultCurrency },
        create: { key: 'DEFAULT_CURRENCY', value: defaultCurrency },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de devise mis à jour avec succès.',
    });
  } catch (error: any) {
    console.error('Error updating currency settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la devise' },
      { status: 500 }
    );
  }
}
