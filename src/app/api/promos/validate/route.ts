import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Veuillez entrer un code promo.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return NextResponse.json({ success: false, message: `Code promo "${cleanCode}" non valide ou inexistant.` }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ success: false, message: `Le code promo "${cleanCode}" est désactivé.` }, { status: 400 });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, message: `Le code promo "${cleanCode}" a expiré.` }, { status: 400 });
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ success: false, message: `Le code promo "${cleanCode}" a atteint son nombre d'utilisations limite.` }, { status: 400 });
    }

    const total = Number(cartTotal || 0);

    if (promo.minPurchaseAmount > 0 && total < promo.minPurchaseAmount) {
      return NextResponse.json({
        success: false,
        message: `Ce code promo nécessite un montant minimum de commande de $${promo.minPurchaseAmount.toFixed(2)}.`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = (total * promo.discountValue) / 100;
    } else {
      discountAmount = Math.min(promo.discountValue, total);
    }

    const finalTotal = Math.max(0, total - discountAmount);

    return NextResponse.json({
      success: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
        finalTotal,
      },
      message: `Code promo "${promo.code}" appliqué avec succès (-${promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue.toFixed(2)}`}) !`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
