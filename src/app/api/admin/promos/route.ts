import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, promos });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, minPurchaseAmount, maxUses, expiresAt } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Le code promo est requis' }, { status: 400 });
    }

    if (!discountValue || Number(discountValue) <= 0) {
      return NextResponse.json({ success: false, message: 'La valeur de la réduction doit être supérieure à 0' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check uniqueness
    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: `Le code promo "${cleanCode}" existe déjà.` }, { status: 400 });
    }

    const newPromo = await prisma.promoCode.create({
      data: {
        code: cleanCode,
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        discountValue: Number(discountValue),
        minPurchaseAmount: Number(minPurchaseAmount || 0),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      promo: newPromo,
      message: `Code promo "${newPromo.code}" créé avec succès !`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, discountType, discountValue, minPurchaseAmount, maxUses, expiresAt } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de code promo requis' }, { status: 400 });
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(discountType && { discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE' }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minPurchaseAmount !== undefined && { minPurchaseAmount: Number(minPurchaseAmount) }),
        ...(maxUses !== undefined && { maxUses: maxUses ? Number(maxUses) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json({
      success: true,
      promo: updated,
      message: `Code promo "${updated.code}" mis à jour avec succès.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID requis pour la suppression' }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Code promo supprimé avec succès.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
