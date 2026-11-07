import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimTariffs } from '@/lib/onlinesim';
import { getPaymentInstructions } from '@/lib/payment-instructions';
import { sendTelegramNotification } from '@/lib/telegram';
import { isMaliciousPayload, sanitizeText } from '@/lib/sanitizer';
import { getClientIp, checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`otp_buy:${ip}`, 20, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Trop de requêtes de commande. Veuillez patienter.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { service, country, promoCode } = body;

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Le code du service est requis' },
        { status: 400 }
      );
    }

    if (isMaliciousPayload(service) || isMaliciousPayload(country) || isMaliciousPayload(promoCode)) {
      return NextResponse.json(
        { success: false, message: 'Requête rejetée : caractères non autorisés.' },
        { status: 400 }
      );
    }

    const cleanService = sanitizeText(service, 50).toLowerCase();
    const cleanCountry = sanitizeText(country || '1', 10).replace(/[^0-9]/g, '') || '1';

    // Get live tariff details for sellingPrice & costPrice
    const tariffs = await getOnlineSimTariffs(cleanCountry);
    const serviceObj = tariffs.find((s) => s.code.toLowerCase() === cleanService) || {
      name: cleanService,
      priceUSD: 0.30,
      sellingPriceUSD: 0.45,
    };

    const costPrice = serviceObj.priceUSD || 0.30;
    let sellingPrice = (serviceObj as any).sellingPriceUSD || 0.45;

    // Apply Promo Code discount if provided & valid
    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const cleanPromo = sanitizeText(promoCode, 30).toUpperCase();
      const promo = await prisma.promoCode.findUnique({ where: { code: cleanPromo } });
      if (
        promo &&
        promo.isActive &&
        (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) &&
        (promo.maxUses === null || promo.usedCount < promo.maxUses)
      ) {
        if (promo.minPurchaseAmount <= 0 || sellingPrice >= promo.minPurchaseAmount) {
          let discount = 0;
          if (promo.discountType === 'PERCENTAGE') {
            discount = (sellingPrice * promo.discountValue) / 100;
          } else {
            discount = Math.min(promo.discountValue, sellingPrice);
          }
          sellingPrice = Math.max(0, sellingPrice - discount);

          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    // Shared Payment Instructions
    const paymentInstructions = await getPaymentInstructions();

    // Generate unique OTP Ticket Code
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `OTP-${randomDigits}`;

    const otpOrder = await prisma.otpOrder.create({
      data: {
        ticketCode,
        tzid: 0,
        phone: '',
        service: cleanService,
        country: cleanCountry,
        costPrice,
        sellingPrice,
        status: 'PENDING_PAYMENT',
        paymentInstructions,
      },
    });

    // Send background Telegram Notification to Admin
    sendTelegramNotification({
      title: `OTP ${cleanService.toUpperCase()}`,
      ticketCode: otpOrder.ticketCode,
      type: 'OTP',
      amount: `$${sellingPrice.toFixed(2)} USD`,
      details: `Service : ${cleanService.toUpperCase()}\nPays Code : +${cleanCountry}`,
    }).catch((err) => console.error('Telegram OTP notification error:', err));

    return NextResponse.json({
      success: true,
      ticketCode: otpOrder.ticketCode,
      service: otpOrder.service,
      country: otpOrder.country,
      totalAmount: otpOrder.sellingPrice,
      paymentInstructions: otpOrder.paymentInstructions,
      status: otpOrder.status,
      createdAt: otpOrder.createdAt,
    });
  } catch (error: any) {
    console.error('Error buying OTP number:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
