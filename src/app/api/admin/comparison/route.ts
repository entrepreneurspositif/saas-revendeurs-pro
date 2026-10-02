import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supplierProducts = await prisma.supplierProduct.findMany({
      include: {
        supplier: true,
      },
      orderBy: { costPrice: 'asc' },
    });

    const products = await prisma.product.findMany({
      include: {
        activeSupplierProduct: {
          include: { supplier: true },
        },
      },
    });

    const comparisonMap: Record<string, any[]> = {};

    supplierProducts.forEach((sp) => {
      const normName = sp.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').slice(0, 3).join(' ');
      if (!comparisonMap[normName]) {
        comparisonMap[normName] = [];
      }
      comparisonMap[normName].push({
        supplierProductId: sp.id,
        supplierId: sp.supplier.id,
        supplierName: sp.supplier.name,
        reliabilityScore: sp.supplier.reliabilityScore,
        productName: sp.name,
        costPrice: sp.costPrice,
        stock: sp.stock,
        isAvailable: sp.isAvailable,
        isSupplierActive: sp.supplier.isActive,
      });
    });

    return NextResponse.json({
      success: true,
      comparisons: comparisonMap,
      allMasterProducts: products,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
