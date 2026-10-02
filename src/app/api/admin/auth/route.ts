import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function getStoredAdminPassword(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'admin_password' },
    });
    return setting ? setting.value : DEFAULT_ADMIN_PASSWORD;
  } catch (e) {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('admin_session')?.value;
  const isAuthenticated = authCookie === 'authenticated_admin_session_token_2026';
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const storedPassword = await getStoredAdminPassword();

    if (password === storedPassword) {
      const res = NextResponse.json({ success: true, message: 'Authentification réussie' });
      res.cookies.set('admin_session', 'authenticated_admin_session_token_2026', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return res;
    }

    return NextResponse.json(
      { success: false, message: 'Mot de passe administrateur incorrect' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('admin_session')?.value;
    if (authCookie !== 'authenticated_admin_session_token_2026') {
      return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Le nouveau mot de passe doit contenir au moins 4 caractères' },
        { status: 400 }
      );
    }

    const storedPassword = await getStoredAdminPassword();

    if (currentPassword !== storedPassword) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe actuel est incorrect' },
        { status: 400 }
      );
    }

    // Save new admin password in DB
    await prisma.setting.upsert({
      where: { key: 'admin_password' },
      update: { value: newPassword },
      create: { key: 'admin_password', value: newPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe administrateur modifié avec succès !',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  res.cookies.delete('admin_session');
  return res;
}
