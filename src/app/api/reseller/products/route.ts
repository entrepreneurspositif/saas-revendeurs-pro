import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSaasPrices } from '@/lib/saasPricingHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      include: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const discountPercent = tenant.plan?.marginDiscountPercent || 0;

    // Fetch all active products with supplier products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        activeSupplierProduct: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Fetch tenant's custom product pricing
    const customPrices = await prisma.tenantProductPrice.findMany({
      where: { tenantId: tenant.id },
    });

    const customPricesMap = new Map<string, { customSellingPrice: number | null; isEnabled: boolean }>();
    for (const cp of customPrices) {
      customPricesMap.set(cp.productId, {
        customSellingPrice: cp.customSellingPrice,
        isEnabled: cp.isEnabled,
      });
    }

    const formattedProducts = products.map((p) => {
      const suppCost = p.activeSupplierProduct ? p.activeSupplierProduct.costPrice : 0;
      const customConfig = customPricesMap.get(p.id);
      const customSellingPrice = customConfig?.customSellingPrice ?? null;
      const isEnabled = customConfig !== undefined ? customConfig.isEnabled : true;

      const calc = calculateSaasPrices({
        supplierCost: suppCost,
        baseSellingPrice: p.sellingPrice,
        discountPercent: discountPercent,
        customSellingPrice: customSellingPrice,
      });

      const isExclusive = !p.activeSupplierProductId || p.badge === 'Exclusif' || p.badge === 'VIP';

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        description: p.description,
        badge: p.badge,
        imageUrl: p.imageUrl,
        stock: p.activeSupplierProduct ? p.activeSupplierProduct.stock : 999,
        isExclusive,
        // Pricing details for reseller
        baseSellingPrice: calc.baseSellingPrice,
        discountPercent: calc.discountPercent,
        discountAmount: calc.discountAmount,
        realDiscountPercent: calc.realDiscountPercent,
        resellerBuyPrice: calc.resellerBuyPrice,
        resellerSellingPrice: calc.resellerSellingPrice,
        resellerProfit: calc.resellerProfit,
        isEnabled: isEnabled,
        hasCustomPrice: customSellingPrice !== null && customSellingPrice !== undefined,
      };
    });

    let planFeatures: string[] = [];
    try {
      if (tenant.plan?.features) {
        planFeatures = typeof tenant.plan.features === 'string'
          ? JSON.parse(tenant.plan.features)
          : tenant.plan.features;
      }
    } catch (e) {
      // ignore JSON parse error
    }

    const hasExclusiveFeature =
      planFeatures.includes('exclusive_products') ||
      tenant.planId === 'starter' ||
      tenant.planId === 'pro';

    return NextResponse.json({
      success: true,
      tenantPlan: {
        id: tenant.planId,
        name: tenant.plan?.name || 'Free',
        discountPercent: discountPercent,
        hasExclusiveFeature,
      },
      products: formattedProducts,
    });
  } catch (error: any) {
    console.error('Error fetching reseller products:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const body = await req.json();
    const { productId, customSellingPrice, isEnabled, bulkUpdates } = body;

    // Handle bulk updates
    if (Array.isArray(bulkUpdates)) {
      for (const item of bulkUpdates) {
        if (!item.productId) continue;
        await prisma.tenantProductPrice.upsert({
          where: {
            tenantId_productId: {
              tenantId: tenant.id,
              productId: item.productId,
            },
          },
          update: {
            customSellingPrice: item.customSellingPrice !== undefined && item.customSellingPrice !== null
              ? parseFloat(Number(item.customSellingPrice).toFixed(2))
              : null,
            isEnabled: item.isEnabled !== undefined ? Boolean(item.isEnabled) : true,
          },
          create: {
            tenantId: tenant.id,
            productId: item.productId,
            customSellingPrice: item.customSellingPrice !== undefined && item.customSellingPrice !== null
              ? parseFloat(Number(item.customSellingPrice).toFixed(2))
              : null,
            isEnabled: item.isEnabled !== undefined ? Boolean(item.isEnabled) : true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Tarifs et visibilité mis à jour en masse avec succès',
      });
    }

    // Handle single item update
    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID produit requis' }, { status: 400 });
    }

    const parsedPrice = customSellingPrice !== undefined && customSellingPrice !== null && customSellingPrice !== ''
      ? parseFloat(Number(customSellingPrice).toFixed(2))
      : null;

    const upserted = await prisma.tenantProductPrice.upsert({
      where: {
        tenantId_productId: {
          tenantId: tenant.id,
          productId: productId,
        },
      },
      update: {
        customSellingPrice: parsedPrice,
        ...(isEnabled !== undefined ? { isEnabled: Boolean(isEnabled) } : {}),
      },
      create: {
        tenantId: tenant.id,
        productId: productId,
        customSellingPrice: parsedPrice,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tarif produit enregistré',
      item: upserted,
    });
  } catch (error: any) {
    console.error('Error updating reseller product price:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
