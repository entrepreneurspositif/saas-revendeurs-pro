import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get('subdomain');
    const domain = searchParams.get('domain');

    if (!subdomain && !domain) {
      return NextResponse.json(
        { success: false, message: 'Sous-domaine ou domaine requis' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findFirst({
      where: subdomain
        ? { subdomain: subdomain.toLowerCase().trim() }
        : { customDomain: domain?.toLowerCase().trim() },
      include: {
        plan: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: 'Boutique introuvable' },
        { status: 404 }
      );
    }

    if (!tenant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Cette boutique est temporairement indisponible.' },
        { status: 403 }
      );
    }

    // Get tenant's custom product pricing & visibility
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

    // Fetch active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        activeSupplierProduct: {
          select: {
            stock: true,
            supplier: {
              select: { isActive: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let planFeatures: string[] = [];
    try {
      if (tenant.plan?.features) {
        planFeatures = typeof tenant.plan.features === 'string'
          ? JSON.parse(tenant.plan.features)
          : tenant.plan.features;
      }
    } catch (e) {
      // ignore
    }

    const hasExclusiveCatalog =
      planFeatures.includes('exclusive_products') ||
      tenant.planId === 'starter' ||
      tenant.planId === 'pro';

    // Filter only enabled products and format for public view
    const publicProducts = products
      .filter((p) => {
        const isExclusive = !p.activeSupplierProduct || p.badge === 'Exclusif' || p.badge === 'VIP';
        if (isExclusive && !hasExclusiveCatalog) return false;

        const config = customPricesMap.get(p.id);
        if (config && config.isEnabled === false) return false;
        return true;
      })
      .map((p) => {
        const isExclusive = !p.activeSupplierProduct || p.badge === 'Exclusif' || p.badge === 'VIP';
        const config = customPricesMap.get(p.id);
        const retailPrice = config?.customSellingPrice !== null && config?.customSellingPrice !== undefined && Number(config?.customSellingPrice) > 0
          ? Number(config.customSellingPrice)
          : p.sellingPrice;

        const stock = p.activeSupplierProduct ? p.activeSupplierProduct.stock : 999;
        const isSupplierActive = p.activeSupplierProduct?.supplier ? p.activeSupplierProduct.supplier.isActive : true;

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          category: p.category,
          sellingPrice: retailPrice,
          currency: p.currency,
          imageUrl: p.imageUrl,
          badge: p.badge || (isExclusive ? 'Exclusif VIP' : null),
          stock: stock,
          isExclusive,
          isAvailable: p.isActive && (p.activeSupplierProduct ? (stock > 0 && isSupplierActive) : true),
        };
      });

    return NextResponse.json({
      success: true,
      hasExclusiveCatalog,
      store: {
        id: tenant.id,
        storeName: tenant.storeName,
        tagline: tenant.tagline,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        logoUrl: tenant.logoUrl,
        bannerUrl: tenant.bannerUrl,
        themeColor: tenant.themeColor,
        themePreset: tenant.themePreset || 'cyber-dark',
        fontFamily: tenant.fontFamily || 'Inter',
        buttonColor: tenant.buttonColor || '#0284c7',
        buttonTextColor: tenant.buttonTextColor || '#ffffff',
        buttonRadius: tenant.buttonRadius || 'rounded-xl',
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        contactWhatsApp: tenant.contactWhatsApp,
        contactTelegram: tenant.contactTelegram,
        bannerAnnouncement: tenant.bannerAnnouncement,
        paymentInstructions: tenant.paymentInstructions,
        facebookPixelId: tenant.facebookPixelId,
        tiktokPixelId: tenant.tiktokPixelId,
        googleAnalyticsId: tenant.googleAnalyticsId,
        welcomeMessage: tenant.welcomeMessage,
        floatingChatEnabled: tenant.floatingChatEnabled ?? true,
        paymentMethods: {
          feexpay: true,
          moneroo: true,
          isCustomGateway: Boolean(tenant.customGatewayEnabled && (tenant.feexpayEnabled || tenant.monerooEnabled)),
        },
      },
      products: publicProducts,
    });
  } catch (error: any) {
    console.error('Error fetching tenant storefront:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
