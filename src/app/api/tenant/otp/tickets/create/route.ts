import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimTariffs } from '@/lib/onlinesim';
import { calculateSaasPrices } from '@/lib/saasPricingHelper';
import { sendTelegramNotification, sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subdomain,
      service,
      country = '1',
      customerEmail,
      customerName,
      customerPhone,
    } = body;

    if (!subdomain || !service) {
      return NextResponse.json(
        { success: false, message: 'Sous-domaine et code de service requis' },
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

    const tariffs = await getOnlineSimTariffs(country);
    const serviceObj = tariffs.find((s) => s.code === service) || {
      name: service,
      priceUSD: 0.30,
      sellingPriceUSD: 0.45,
    };

    // Check if the service is configured or disabled by the reseller
    const serviceConfigs = await prisma.tenantOtpService.findMany({
      where: {
        tenantId: tenant.id,
        serviceCode: { in: [service.toLowerCase(), '*'] },
        country: { in: [country, 'all'] },
      },
    });

    const specificConf = serviceConfigs.find((c) => c.serviceCode === service.toLowerCase() && c.country === country);
    const globalConf = serviceConfigs.find((c) => c.serviceCode === service.toLowerCase() && c.country === 'all');
    const activeConf = specificConf || globalConf;

    const countryWildcard = serviceConfigs.find((c) => c.serviceCode === '*' && c.country === country);
    const globalWildcard = serviceConfigs.find((c) => c.serviceCode === '*' && c.country === 'all');
    const defaultEnabled = countryWildcard ? countryWildcard.isEnabled : (globalWildcard ? globalWildcard.isEnabled : true);

    if (activeConf ? !activeConf.isEnabled : !defaultEnabled) {
      return NextResponse.json(
        { success: false, message: 'Ce service OTP est actuellement indisponible sur cette boutique.' },
        { status: 400 }
      );
    }

    const supplierCost = (serviceObj as any).priceUSD || 0.30;
    const baseSellingPrice = (serviceObj as any).sellingPriceUSD || 0.45;
    const discountPercent = tenant.plan?.marginDiscountPercent || 0;
    const customSellingPrice = activeConf?.customSellingPrice ?? null;

    const pricing = calculateSaasPrices({
      supplierCost,
      baseSellingPrice,
      discountPercent,
      customSellingPrice,
    });

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `OTP-${randomDigits}`;

    let paymentInstructions = tenant.paymentInstructions;
    if (!paymentInstructions || paymentInstructions.trim() === '') {
      paymentInstructions = `=== INSTRUCTIONS DE RÈGLEMENT (${tenant.storeName.toUpperCase()}) ===\n` +
        `1. Effectuez votre règlement de $${pricing.resellerSellingPrice.toFixed(2)} USD (ou équivalent en monnaie locale).\n` +
        `2. Pour confirmer votre commande, contactez immédiatement le service client de la boutique :\n` +
        `   - WhatsApp : ${tenant.contactWhatsApp || 'Non configuré'}\n` +
        `   - Telegram : ${tenant.contactTelegram || 'Non configuré'}\n` +
        `   - Email : ${tenant.contactEmail || tenant.email}\n` +
        `3. Transmettez impérativement votre CODE TICKET OTP : ${ticketCode}\n` +
        `4. Dès validation de votre paiement, votre numéro virtuel sera activé et vous recevrez votre code SMS ici même en temps réel.`;
    } else {
      paymentInstructions = `=== TICKET DE COMMANDE OTP : ${ticketCode} ===\n` +
        `Service : ${serviceObj.name.toUpperCase()} (Pays Code +${country})\n` +
        `Montant à régler : $${pricing.resellerSellingPrice.toFixed(2)} USD\n\n` +
        `${paymentInstructions}\n\n` +
        `RAPPEL : Mentionnez toujours le code ${ticketCode} lors de votre paiement !`;
    }

    const otpOrder = await prisma.otpOrder.create({
      data: {
        ticketCode,
        tzid: 0,
        phone: '',
        service,
        country,
        costPrice: pricing.supplierCost,
        sellingPrice: pricing.resellerSellingPrice,
        status: 'PENDING_PAYMENT',
        paymentInstructions,
        tenantId: tenant.id,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        resellerProfit: pricing.resellerProfit,
        platformProfit: pricing.platformProfit,
      },
    });

    sendTelegramNotification({
      title: `[Boutique ${tenant.storeName}] Ticket OTP Créé`,
      ticketCode: otpOrder.ticketCode,
      type: 'OTP',
      amount: `$${pricing.resellerSellingPrice.toFixed(2)} USD`,
      details: `Boutique : ${tenant.storeName} (/store/${tenant.subdomain})\nService : ${serviceObj.name}\nPays : +${country}\nClient : ${customerName || 'Anonyme'} (${customerEmail || 'Sans email'})`,
    }).catch((err) => console.error('Telegram notification error:', err));

    sendResellerTelegramNotification({
      tenantId: tenant.id,
      eventType: 'NEW_OTP',
      title: `Nouvelle Commande de Numéro Virtuel (OTP)`,
      ticketCode: otpOrder.ticketCode,
      amount: `$${pricing.resellerSellingPrice.toFixed(2)} USD`,
      resellerProfit: `$${pricing.resellerProfit.toFixed(2)} USD`,
      details: `Service : ${serviceObj.name}\nPays : +${country}\nClient : ${customerName || 'Client'} (${customerEmail || customerPhone || 'Sans contact'})`,
    }).catch((err) => console.error('Reseller Telegram OTP notification error:', err));

    return NextResponse.json({
      success: true,
      ticketCode: otpOrder.ticketCode,
      serviceName: serviceObj.name,
      service: otpOrder.service,
      country: otpOrder.country,
      totalAmount: otpOrder.sellingPrice,
      paymentInstructions: otpOrder.paymentInstructions,
      status: otpOrder.status,
      resellerWhatsApp: tenant.contactWhatsApp || null,
      resellerStoreName: tenant.storeName,
      message: 'Ticket OTP généré avec succès !',
    });
  } catch (error: any) {
    console.error('Error creating tenant OTP ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
