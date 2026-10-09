import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimTariffs, POPULAR_COUNTRIES } from '@/lib/onlinesim';
import { calculateSaasPrices } from '@/lib/saasPricingHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get('subdomain')?.trim();
    const country = searchParams.get('country') || '1';

    if (!subdomain) {
      return NextResponse.json(
        { success: false, message: 'Sous-domaine requis' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: { plan: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Boutique introuvable ou inactive' },
        { status: 404 }
      );
    }

    const rawServices = await getOnlineSimTariffs(country);
    const discountPercent = tenant.plan?.marginDiscountPercent || 0;

    // Fetch tenant's configured OTP services
    const configs = await prisma.tenantOtpService.findMany({
      where: {
        tenantId: tenant.id,
        country: { in: [country, 'all'] },
      },
    });

    const countryConfigMap = new Map<string, any>();
    const globalConfigMap = new Map<string, any>();

    for (const c of configs) {
      if (c.country === country) {
        countryConfigMap.set(c.serviceCode.toLowerCase(), c);
      } else if (c.country === 'all') {
        globalConfigMap.set(c.serviceCode.toLowerCase(), c);
      }
    }

    const countryWildcard = countryConfigMap.get('*');
    const globalWildcard = globalConfigMap.get('*');
    const defaultEnabled = countryWildcard ? countryWildcard.isEnabled : (globalWildcard ? globalWildcard.isEnabled : true);

    const formattedServices = rawServices
      .filter((s: any) => {
        const sCode = s.code.toLowerCase();
        const countryConf = countryConfigMap.get(sCode);
        if (countryConf) {
          return countryConf.isEnabled;
        }
        const globalConf = globalConfigMap.get(sCode);
        if (globalConf) {
          return globalConf.isEnabled;
        }
        return defaultEnabled;
      })
      .map((s: any) => {
        const sCode = s.code.toLowerCase();
        const config = countryConfigMap.get(sCode) || globalConfigMap.get(sCode);
        const customSellingPrice = config?.customSellingPrice ?? null;

        const supplierCost = s.priceUSD || 0.30;
        const baseSellingPrice = s.sellingPriceUSD || 0.45;

        const calc = calculateSaasPrices({
          supplierCost,
          baseSellingPrice,
          discountPercent,
          customSellingPrice,
        });

        return {
          code: s.code,
          name: s.name,
          category: s.category,
          stock: s.stock,
          supplierCost: calc.supplierCost,
          resellerBuyPrice: calc.resellerBuyPrice,
          sellingPrice: calc.resellerSellingPrice,
          resellerProfit: calc.resellerProfit,
        };
      });

    return NextResponse.json({
      success: true,
      countries: POPULAR_COUNTRIES,
      services: formattedServices,
      tenant: {
        storeName: tenant.storeName,
        subdomain: tenant.subdomain,
        themeColor: tenant.themeColor,
        contactWhatsApp: tenant.contactWhatsApp,
        contactTelegram: tenant.contactTelegram,
        contactEmail: tenant.contactEmail,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tenant OTP tariffs:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
