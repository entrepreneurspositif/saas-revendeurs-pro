import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimTariffs, POPULAR_COUNTRIES } from '@/lib/onlinesim';
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

    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || '1';

    const discountPercent = tenant.plan?.marginDiscountPercent || 0;
    const rawServices = await getOnlineSimTariffs(country);

    // Fetch tenant's configured OTP services for this country and global ('all')
    const configs = await prisma.tenantOtpService.findMany({
      where: {
        tenantId: tenant.id,
        country: { in: [country, 'all'] },
      },
    });

    // Create lookup map: specific country has higher precedence than 'all'
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

    const formattedServices = rawServices.map((s: any) => {
      const sCode = s.code.toLowerCase();
      const config = countryConfigMap.get(sCode) || globalConfigMap.get(sCode);

      const isEnabled = config ? config.isEnabled : defaultEnabled;
      const customSellingPrice = config?.customSellingPrice ?? null;
      const isGlobalOverride = !countryConfigMap.has(sCode) && globalConfigMap.has(sCode);

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
        baseSellingPrice: calc.baseSellingPrice,
        discountAmount: calc.discountAmount,
        realDiscountPercent: calc.realDiscountPercent,
        resellerBuyPrice: calc.resellerBuyPrice,
        sellingPrice: calc.resellerSellingPrice,
        resellerProfit: calc.resellerProfit,
        isEnabled,
        hasCustomPrice: customSellingPrice !== null && customSellingPrice !== undefined,
        customSellingPrice,
        isGlobalOverride,
      };
    });

    return NextResponse.json({
      success: true,
      country,
      countries: POPULAR_COUNTRIES,
      tenantPlan: {
        id: tenant.planId,
        name: tenant.plan?.name || 'Free',
        discountPercent,
      },
      services: formattedServices,
    });
  } catch (error: any) {
    console.error('Error fetching reseller OTP services:', error);
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
    const { action, serviceCode, country = '1', customSellingPrice, isEnabled, applyAllCountries, bulkUpdates } = body;

    // Handle Fast Quick Action: ENABLE_ALL or DISABLE_ALL
    if (action === 'ENABLE_ALL' || action === 'DISABLE_ALL') {
      const setEnabled = action === 'ENABLE_ALL';
      const targetCountry = country || '1';

      await prisma.tenantOtpService.upsert({
        where: {
          tenantId_serviceCode_country: {
            tenantId: tenant.id,
            serviceCode: '*',
            country: targetCountry,
          },
        },
        update: { isEnabled: setEnabled },
        create: {
          tenantId: tenant.id,
          serviceCode: '*',
          country: targetCountry,
          isEnabled: setEnabled,
        },
      });

      await prisma.tenantOtpService.updateMany({
        where: {
          tenantId: tenant.id,
          country: targetCountry,
        },
        data: {
          isEnabled: setEnabled,
        },
      });

      return NextResponse.json({
        success: true,
        message: setEnabled
          ? `Tous les services OTP ont été activés pour ce pays.`
          : `Tous les services OTP ont été masqués pour ce pays.`,
      });
    }

    // Handle bulk updates
    if (Array.isArray(bulkUpdates) && bulkUpdates.length > 0) {
      for (const item of bulkUpdates) {
        if (!item.serviceCode) continue;
        const targetCountry = item.applyAllCountries ? 'all' : (item.country || country || '1');
        const parsedPrice =
          item.customSellingPrice !== undefined && item.customSellingPrice !== null && item.customSellingPrice !== ''
            ? parseFloat(Number(item.customSellingPrice).toFixed(2))
            : null;

        await prisma.tenantOtpService.upsert({
          where: {
            tenantId_serviceCode_country: {
              tenantId: tenant.id,
              serviceCode: item.serviceCode.toLowerCase(),
              country: targetCountry,
            },
          },
          update: {
            customSellingPrice: parsedPrice,
            ...(item.isEnabled !== undefined ? { isEnabled: Boolean(item.isEnabled) } : {}),
          },
          create: {
            tenantId: tenant.id,
            serviceCode: item.serviceCode.toLowerCase(),
            country: targetCountry,
            customSellingPrice: parsedPrice,
            isEnabled: item.isEnabled !== undefined ? Boolean(item.isEnabled) : true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Modifications des services OTP enregistrées avec succès en masse.',
      });
    }

    // Single item update
    if (!serviceCode) {
      return NextResponse.json({ success: false, message: 'Code de service OTP requis' }, { status: 400 });
    }

    const targetCountry = applyAllCountries ? 'all' : (country || '1');
    const parsedPrice =
      customSellingPrice !== undefined && customSellingPrice !== null && customSellingPrice !== ''
        ? parseFloat(Number(customSellingPrice).toFixed(2))
        : null;

    const upserted = await prisma.tenantOtpService.upsert({
      where: {
        tenantId_serviceCode_country: {
          tenantId: tenant.id,
          serviceCode: serviceCode.toLowerCase(),
          country: targetCountry,
        },
      },
      update: {
        customSellingPrice: parsedPrice,
        ...(isEnabled !== undefined ? { isEnabled: Boolean(isEnabled) } : {}),
      },
      create: {
        tenantId: tenant.id,
        serviceCode: serviceCode.toLowerCase(),
        country: targetCountry,
        customSellingPrice: parsedPrice,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Paramètres OTP pour ${serviceCode.toUpperCase()} enregistrés.`,
      config: upserted,
    });
  } catch (error: any) {
    console.error('Error updating reseller OTP service:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
