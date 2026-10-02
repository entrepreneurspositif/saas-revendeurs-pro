import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'client@example.com',
          name: 'Jean Dupont',
          role: 'CUSTOMER',
          walletBalance: 250.0,
        },
        include: { orders: true },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount = 50 } = await req.json();

    let user = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'client@example.com',
          name: 'Jean Dupont',
          role: 'CUSTOMER',
          walletBalance: 250.0,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { walletBalance: { increment: Number(amount) } },
    });

    return NextResponse.json({
      success: true,
      message: `$${amount} ajoutés à votre solde avec succès!`,
      newBalance: updatedUser.walletBalance,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
