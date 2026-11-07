import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimState } from '@/lib/onlinesim';
import { getClientIp, checkRateLimit, recordFailure } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`otp_state:${ip}`, 45, 60000);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trop de requêtes de vérification OTP. Veuillez patienter une minute.',
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('ticketCode')?.trim();
    const tzidParam = searchParams.get('tzid')?.trim();

    let otpOrder = null;

    if (code) {
      const cleanCode = code.toUpperCase();
      otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: cleanCode }, { id: cleanCode }],
        },
      });
    } else if (tzidParam) {
      otpOrder = await prisma.otpOrder.findFirst({
        where: { tzid: parseInt(tzidParam, 10) },
      });
    }

    if (!otpOrder) {
      recordFailure(`otp_state:${ip}`, 10, 5 * 60 * 1000);
      return NextResponse.json(
        { success: false, message: 'Commande OTP non trouvée' },
        { status: 404 }
      );
    }

    // Call OnlineSIM state API
    const stateResult = await getOnlineSimState(otpOrder.tzid, otpOrder.createdAt);

    let needsUpdate = false;
    const updateData: any = {};

    if (stateResult.success && stateResult.phone && (!otpOrder.phone || otpOrder.phone === '')) {
      updateData.phone = stateResult.phone;
      needsUpdate = true;
    }

    if (stateResult.success && stateResult.smsCode && otpOrder.status !== 'COMPLETED') {
      updateData.status = 'COMPLETED';
      updateData.smsCode = stateResult.smsCode;
      updateData.fullSms = stateResult.fullSms;
      needsUpdate = true;
    }

    if (needsUpdate) {
      otpOrder = await prisma.otpOrder.update({
        where: { id: otpOrder.id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: otpOrder.id,
        ticketCode: otpOrder.ticketCode,
        service: otpOrder.service,
        country: otpOrder.country,
        phone: otpOrder.phone || stateResult.phone || '',
        tzid: otpOrder.tzid,
        sellingPrice: otpOrder.sellingPrice,
        status: otpOrder.status,
        smsCode: otpOrder.smsCode || stateResult.smsCode || null,
        fullSms: otpOrder.fullSms || stateResult.fullSms || null,
        paymentInstructions: otpOrder.paymentInstructions,
        timeRemaining: stateResult.timeRemaining || 900,
        createdAt: otpOrder.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
