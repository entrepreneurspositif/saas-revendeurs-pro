import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnlineSimState } from '@/lib/onlinesim';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim() || searchParams.get('ticketCode')?.trim();
    const subdomain = searchParams.get('subdomain')?.trim();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Code ticket requis' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase();

    const otpOrder = await prisma.otpOrder.findFirst({
      where: {
        OR: [{ ticketCode: cleanCode }, { id: cleanCode }],
      },
      include: {
        tenant: {
          select: {
            storeName: true,
            subdomain: true,
            contactWhatsApp: true,
            contactTelegram: true,
            contactEmail: true,
          },
        },
      },
    });

    if (!otpOrder) {
      return NextResponse.json(
        { success: false, message: 'Ticket OTP introuvable' },
        { status: 404 }
      );
    }

    // Optional subdomain verification
    if (subdomain && otpOrder.tenant && otpOrder.tenant.subdomain !== subdomain) {
      return NextResponse.json(
        { success: false, message: 'Ce ticket n\'appartient pas à cette boutique' },
        { status: 403 }
      );
    }

    let stateResult: any = null;
    let timeRemaining = 900;

    // If waiting for SMS, poll OnlineSIM
    if (otpOrder.status === 'WAITING_SMS' && otpOrder.tzid > 0) {
      stateResult = await getOnlineSimState(otpOrder.tzid, otpOrder.createdAt);
      timeRemaining = stateResult.timeRemaining || 900;

      let needsUpdate = false;
      const updateData: any = {};

      if (stateResult.success && stateResult.phone && (!otpOrder.phone || otpOrder.phone === '')) {
        updateData.phone = stateResult.phone;
        needsUpdate = true;
      }

      if (stateResult.success && stateResult.smsCode) {
        updateData.status = 'COMPLETED';
        updateData.smsCode = stateResult.smsCode;
        updateData.fullSms = stateResult.fullSms;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const updated = await prisma.otpOrder.update({
          where: { id: otpOrder.id },
          data: updateData,
        });
        otpOrder.phone = updated.phone;
        otpOrder.status = updated.status;
        otpOrder.smsCode = updated.smsCode;
        otpOrder.fullSms = updated.fullSms;
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: otpOrder.id,
        ticketCode: otpOrder.ticketCode,
        service: otpOrder.service,
        country: otpOrder.country,
        phone: otpOrder.phone || stateResult?.phone || '',
        tzid: otpOrder.tzid,
        sellingPrice: otpOrder.sellingPrice,
        status: otpOrder.status,
        smsCode: otpOrder.smsCode || stateResult?.smsCode || null,
        fullSms: otpOrder.fullSms || stateResult?.fullSms || null,
        paymentInstructions: otpOrder.paymentInstructions,
        errorMessage: otpOrder.errorMessage,
        timeRemaining,
        createdAt: otpOrder.createdAt,
        store: otpOrder.tenant
          ? {
              storeName: otpOrder.tenant.storeName,
              subdomain: otpOrder.tenant.subdomain,
              contactWhatsApp: otpOrder.tenant.contactWhatsApp,
              contactTelegram: otpOrder.tenant.contactTelegram,
              contactEmail: otpOrder.tenant.contactEmail,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error looking up tenant OTP ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
