import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'active_theme' },
    });

    const theme = setting ? setting.value : 'cyberpunk';
    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    return NextResponse.json({ success: false, theme: 'cyberpunk', message: error.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();
    const validThemes = ['cyberpunk', 'emerald', 'violet', 'light'];

    if (!theme || !validThemes.includes(theme)) {
      return NextResponse.json({ success: false, message: 'Thème invalide' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'active_theme' },
      update: { value: theme },
      create: { key: 'active_theme', value: theme },
    });

    return NextResponse.json({ success: true, theme, message: `Thème mis à jour : ${theme}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
