import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResellerTelegramNotification } from '@/lib/telegram';
import { getFeexPayConfig, executeFeexPayPayout } from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [payouts, feexConfig] = await Promise.all([
      prisma.payoutRequest.findMany({
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              storeName: true,
              subdomain: true,
              walletBalance: true,
              totalEarnings: true,
              contactWhatsApp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      getFeexPayConfig(),
    ]);

    const pendingPayouts = payouts.filter((p) => p.status === 'PENDING');
    const approvedPayouts = payouts.filter((p) => p.status === 'APPROVED');
    const rejectedPayouts = payouts.filter((p) => p.status === 'REJECTED');

    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const approvedAmount = approvedPayouts.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalCount: payouts.length,
        pendingCount: pendingPayouts.length,
        pendingAmount: parseFloat(pendingAmount.toFixed(2)),
        approvedCount: approvedPayouts.length,
        approvedAmount: parseFloat(approvedAmount.toFixed(2)),
        rejectedCount: rejectedPayouts.length,
      },
      autoPayoutSettings: {
        enabled: feexConfig.autoPayoutEnabled,
        maxUsd: feexConfig.autoPayoutMaxUsd,
        cooldownMinutes: feexConfig.autoPayoutCooldownMinutes,
      },
      payouts,
    });
  } catch (error: any) {
    console.error('Error fetching admin payouts:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { enabled, maxUsd, cooldownMinutes } = body;

    const updates = [
      {
        key: 'feexpay_auto_payout_enabled',
        value: String(enabled !== false),
      },
      {
        key: 'feexpay_auto_payout_max_usd',
        value: String(Math.max(1, parseFloat(String(maxUsd || 25)))),
      },
      {
        key: 'feexpay_auto_payout_cooldown_minutes',
        value: String(Math.max(0, parseInt(String(cooldownMinutes ?? 60), 10))),
      },
    ];

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de sécurité Auto-Payout FeexPay enregistrés avec succès !',
    });
  } catch (error: any) {
    console.error('Error updating auto-payout settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payoutId, action, adminNote } = body;

    if (!payoutId || !action) {
      return NextResponse.json(
        { success: false, message: 'ID de retrait et action requis.' },
        { status: 400 }
      );
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: { tenant: true },
    });

    if (!payout) {
      return NextResponse.json(
        { success: false, message: 'Demande de retrait introuvable.' },
        { status: 404 }
      );
    }

    if (payout.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Cette demande de retrait a déjà été traitée.' },
        { status: 400 }
      );
    }

    if (action === 'AUTO_PAY_FEEXPAY') {
      const feexResult = await executeFeexPayPayout({
        paymentMethod: payout.paymentMethod,
        paymentDetails: payout.paymentDetails,
        amountUsd: payout.amount,
        reference: payout.reference,
        email: payout.tenant?.email,
      });

      if (!feexResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: feexResult.message,
          },
          { status: 400 }
        );
      }

      const noteText =
        adminNote?.trim() ||
        `⚡ Payé via API FeexPay (${feexResult.amountXof} FCFA envoyés au ${feexResult.phoneNumber}) — Réf: ${feexResult.feexReference}`;

      const updatedPayout = await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: {
          status: 'APPROVED',
          adminNote: noteText,
          processedAt: new Date(),
        },
      });

      sendResellerTelegramNotification({
        tenantId: payout.tenantId,
        eventType: 'PAYOUT',
        title: `⚡ Retrait Payé via FeexPay (${payout.reference})`,
        ticketCode: payout.reference,
        amount: `$${payout.amount.toFixed(2)} USD (${feexResult.amountXof} FCFA)`,
        details: `✅ Votre retrait de $${payout.amount.toFixed(2)} USD (${feexResult.amountXof} FCFA) a été transféré sur votre numéro ${feexResult.phoneNumber} !\nRéf Transaction : ${feexResult.feexReference}`,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        payout: updatedPayout,
        message: `⚡ Transfert FeexPay réussi ! ${feexResult.amountXof} FCFA envoyés au ${feexResult.phoneNumber} (Réf: ${feexResult.feexReference}).`,
      });
    } else if (action === 'APPROVE') {
      const updatedPayout = await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: {
          status: 'APPROVED',
          adminNote: adminNote?.trim() || 'Paiement effectué et validé par le Super Admin',
          processedAt: new Date(),
        },
      });

      sendResellerTelegramNotification({
        tenantId: payout.tenantId,
        eventType: 'PAYOUT',
        title: `Retrait Approuvé & Payé (${payout.reference})`,
        ticketCode: payout.reference,
        amount: `$${payout.amount.toFixed(2)} USD`,
        details: `✅ Votre retrait de $${payout.amount.toFixed(2)} USD via ${payout.paymentMethod} (${payout.paymentDetails}) a été exécuté avec succès !\nNote Admin : ${updatedPayout.adminNote}`,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        payout: updatedPayout,
        message: `Retrait ${payout.reference} ($${payout.amount.toFixed(2)}) validé et marqué comme payé !`,
      });
    } else if (action === 'REJECT') {
      // Refund amount back to tenant walletBalance
      await prisma.tenant.update({
        where: { id: payout.tenantId },
        data: {
          walletBalance: { increment: payout.amount },
        },
      });

      const updatedPayout = await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: {
          status: 'REJECTED',
          adminNote: adminNote?.trim() || 'Demande refusée — Solde recrédité sur votre portefeuille',
          processedAt: new Date(),
        },
      });

      sendResellerTelegramNotification({
        tenantId: payout.tenantId,
        eventType: 'PAYOUT',
        title: `Demande de Retrait Annulée (${payout.reference})`,
        ticketCode: payout.reference,
        amount: `+$${payout.amount.toFixed(2)} USD (Recrédité)`,
        details: `❌ Votre demande de retrait de $${payout.amount.toFixed(2)} USD a été annulée.\nVotre solde disponible a été intégralement recrédité.\nMotif : ${updatedPayout.adminNote}`,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        payout: updatedPayout,
        message: `Demande ${payout.reference} refusée. Le montant de $${payout.amount.toFixed(2)} a été recrédité au revendeur.`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Action invalide.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing admin payout:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
