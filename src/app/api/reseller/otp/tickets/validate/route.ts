import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buyOnlineSimNumber } from '@/lib/onlinesim';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const { orderId, ticketCode, manualPhone, manualSmsCode } = await req.json();

    if (!orderId && !ticketCode) {
      return NextResponse.json(
        { success: false, message: 'ID ou code de commande OTP requis' },
        { status: 400 }
      );
    }

    const whereClause: any = orderId ? { id: orderId } : { ticketCode };

    const otpOrder = await prisma.otpOrder.findUnique({
      where: whereClause,
    });

    if (!otpOrder) {
      return NextResponse.json({ success: false, message: 'Ticket OTP introuvable' }, { status: 404 });
    }

    // Ownership check
    if (otpOrder.tenantId !== sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'êtes pas autorisé à valider ce ticket' },
        { status: 403 }
      );
    }

    if (otpOrder.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        message: 'Ce ticket OTP est déjà entièrement livré !',
        order: otpOrder,
      });
    }

    if (otpOrder.status === 'WAITING_SMS') {
      if (manualSmsCode && typeof manualSmsCode === 'string' && manualSmsCode.trim()) {
        const completedOrder = await prisma.otpOrder.update({
          where: { id: otpOrder.id },
          data: {
            smsCode: manualSmsCode.trim(),
            status: 'COMPLETED',
          },
        });
        return NextResponse.json({
          success: true,
          message: 'Code SMS délivré au client avec succès ! Ticket clôturé.',
          order: completedOrder,
        });
      }
      return NextResponse.json({
        success: true,
        message: 'Numéro déjà activé. En attente de réception du SMS.',
        order: otpOrder,
      });
    }

    let assignedPhone = '';
    let assignedTzid = 0;
    let newStatus = 'WAITING_SMS';

    if (manualPhone && typeof manualPhone === 'string' && manualPhone.trim()) {
      // Manual phone number entry by reseller
      assignedPhone = manualPhone.trim();
      assignedTzid = 0;
      if (manualSmsCode && typeof manualSmsCode === 'string' && manualSmsCode.trim()) {
        newStatus = 'COMPLETED';
      }
    } else {
      // Automated OnlineSIM reservation
      const result = await buyOnlineSimNumber(otpOrder.service, otpOrder.country);

      if (!result.success) {
        await prisma.otpOrder.update({
          where: { id: otpOrder.id },
          data: {
            errorMessage: result.message || 'Numéro non disponible sur OnlineSIM',
          },
        });

        return NextResponse.json(
          {
            success: false,
            message: `Échec d'attribution OnlineSIM: ${result.message || 'Numéro non disponible'}. Vous pouvez saisir un numéro manuellement.`,
          },
          { status: 400 }
        );
      }

      assignedPhone = result.phone || '';
      assignedTzid = result.tzid || 0;
    }

    // Update OTP order
    const updatedOrder = await prisma.otpOrder.update({
      where: { id: otpOrder.id },
      data: {
        phone: assignedPhone,
        tzid: assignedTzid,
        status: newStatus,
        smsCode: manualSmsCode?.trim() || null,
        errorMessage: null,
      },
    });

    // Credit reseller profit to their wallet
    if (otpOrder.resellerProfit > 0) {
      await prisma.tenant.update({
        where: { id: sessionToken },
        data: {
          walletBalance: { increment: otpOrder.resellerProfit },
          totalEarnings: { increment: otpOrder.resellerProfit },
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      profitCredited: otpOrder.resellerProfit,
      message: `Ticket OTP validé avec succès ! Numéro attribué : ${assignedPhone}. Bénéfice (+${otpOrder.resellerProfit.toFixed(2)}$) crédité.`,
    });
  } catch (error: any) {
    console.error('Error validating reseller OTP ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
