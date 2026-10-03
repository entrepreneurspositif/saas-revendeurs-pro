import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPricingRules, calculateSellingPriceFromCost, PricingMarginRule } from '@/lib/pricingHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rules = await getPricingRules();
    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rules, applyToProducts } = await req.json();

    if (!Array.isArray(rules)) {
      return NextResponse.json({ success: false, message: 'Format de règles invalide' }, { status: 400 });
    }

    // Save rules to Setting DB
    await prisma.setting.upsert({
      where: { key: 'pricing_margin_rules' },
      update: { value: JSON.stringify(rules) },
      create: { key: 'pricing_margin_rules', value: JSON.stringify(rules) },
    });

    let updatedCount = 0;

    if (applyToProducts) {
      const products = await prisma.product.findMany({
        include: { activeSupplierProduct: true },
      });

      for (const p of products) {
        const costPrice = p.activeSupplierProduct?.costPrice ?? (p.sellingPrice > 0 ? Number((p.sellingPrice / 1.75).toFixed(2)) : 0);
        if (costPrice > 0) {
          const newSellingPrice = calculateSellingPriceFromCost(costPrice, rules as PricingMarginRule[]);
          if (newSellingPrice > 0 && newSellingPrice !== p.sellingPrice) {
            await prisma.product.update({
              where: { id: p.id },
              data: { sellingPrice: newSellingPrice },
            });
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: applyToProducts
        ? `Règles de marge enregistrées et appliquées à ${updatedCount} produit(s).`
        : 'Règles de marge enregistrées avec succès.',
      updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
