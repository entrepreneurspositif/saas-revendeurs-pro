import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification, sendResellerTelegramNotification } from '@/lib/telegram';
import {
  getFeexPayConfig,
  isFeexPaySupportedMethod,
  executeFeexPayPayout,
} from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        name: true,
        storeName: true,
        walletBalance: true,
        totalEarnings: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalWithdrawn = payouts
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingWithdrawn = payouts
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const feexConfig = await getFeexPayConfig();

    return NextResponse.json({
      success: true,
      walletBalance: parseFloat(tenant.walletBalance.toFixed(2)),
      totalEarnings: parseFloat(tenant.totalEarnings.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      pendingWithdrawn: parseFloat(pendingWithdrawn.toFixed(2)),
      autoPayoutEnabled: feexConfig.autoPayoutEnabled,
      autoPayoutMaxUsd: feexConfig.autoPayoutMaxUsd,
      payouts,
    });
  } catch (error: any) {
    console.error('Error fetching reseller payouts:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, paymentMethod, paymentDetails } = body;

    const requestedAmount = parseFloat(Number(amount).toFixed(2));
    if (isNaN(requestedAmount) || requestedAmount < 1) {
      return NextResponse.json(
        { success: false, message: 'Le montant minimum de retrait est de $1.00 USD.' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !String(paymentMethod).trim()) {
      return NextResponse.json(
        { success: false, message: 'Veuillez choisir un moyen de paiement pour votre retrait.' },
        { status: 400 }
      );
    }

    if (!paymentDetails || !String(paymentDetails).trim()) {
      return NextResponse.json(
        { success: false, message: 'Veuillez renseigner vos coordonnées de réception (Numéro Mobile Money ou Adresse Wallet).' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Compte revendeur introuvable ou inactif.' },
        { status: 404 }
      );
    }

    if (tenant.walletBalance < requestedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Solde disponible insuffisant ($${tenant.walletBalance.toFixed(2)} USD). Vous avez demandé $${requestedAmount.toFixed(2)} USD.`,
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // SECURITY LOCK 1: Atomic conditional decrement (anti-race-condition)
    // =========================================================================
    const atomicLock = await prisma.tenant.updateMany({
      where: {
        id: tenant.id,
        isActive: true,
        walletBalance: { gte: requestedAmount },
      },
      data: {
        walletBalance: { decrement: requestedAmount },
      },
    });

    if (atomicLock.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Opération refusée : solde insuffisant ou requête simultanée détectée.',
        },
        { status: 400 }
      );
    }

    const updatedTenant = await prisma.tenant.findUnique({
      where: { id: tenant.id },
    });
    const newWalletBalance = parseFloat((updatedTenant?.walletBalance || 0).toFixed(2));

    const reference = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the payout record in PENDING state first (idempotency anchor)
    let payout = await prisma.payoutRequest.create({
      data: {
        reference,
        tenantId: tenant.id,
        amount: requestedAmount,
        paymentMethod: String(paymentMethod).trim(),
        paymentDetails: String(paymentDetails).trim(),
        status: 'PENDING',
      },
    });

    // =========================================================================
    // SECURITY LOCKS 2-5: Evaluate eligibility for Instant FeexPay Auto-Payout (Method B)
    // =========================================================================
    const feexConfig = await getFeexPayConfig();
    const isMobileMoney = isFeexPaySupportedMethod(paymentMethod);

    let autoPayEligible = feexConfig.autoPayoutEnabled && isMobileMoney;
    let manualReviewReason = '';

    if (!feexConfig.autoPayoutEnabled) {
      manualReviewReason = 'Auto-Payout désactivé par le Super Admin';
    } else if (!isMobileMoney) {
      manualReviewReason = `Méthode ${paymentMethod} nécessitant un envoi manuel`;
    } else if (requestedAmount > feexConfig.autoPayoutMaxUsd) {
      autoPayEligible = false;
      manualReviewReason = `Montant ($${requestedAmount.toFixed(2)}) supérieur au plafond de virement automatique ($${feexConfig.autoPayoutMaxUsd.toFixed(2)} USD) — En attente de validation Super Admin`;
    }

    // Security Lock 3: Cooldown check (prevent rapid consecutive auto-withdrawals)
    if (autoPayEligible && feexConfig.autoPayoutCooldownMinutes > 0) {
      const cooldownThreshold = new Date(
        Date.now() - feexConfig.autoPayoutCooldownMinutes * 60 * 1000
      );
      const recentPayout = await prisma.payoutRequest.findFirst({
        where: {
          tenantId: tenant.id,
          id: { not: payout.id },
          status: 'APPROVED',
          processedAt: { gte: cooldownThreshold },
        },
      });
      if (recentPayout) {
        autoPayEligible = false;
        manualReviewReason = `Délai de sécurité anti-spam (${feexConfig.autoPayoutCooldownMinutes} min entre 2 retraits automatiques) — Mis en attente de validation Super Admin`;
      }
    }

    // Security Lock 4: Accounting Integrity Audit (walletBalance + total payouts <= totalEarnings)
    if (autoPayEligible) {
      const allActivePayouts = await prisma.payoutRequest.findMany({
        where: {
          tenantId: tenant.id,
          status: { in: ['APPROVED', 'PENDING'] },
        },
        select: { amount: true },
      });
      const sumPayouts = allActivePayouts.reduce((sum, p) => sum + p.amount, 0);
      const totalAccounted = newWalletBalance + sumPayouts;

      if (totalAccounted > (tenant.totalEarnings || 0) + 0.05) {
        autoPayEligible = false;
        manualReviewReason = `Audit de sécurité comptable : vérification manuelle requise par le Super Admin`;
      }
    }

    // =========================================================================
    // EXECUTE AUTOMATIC FEEXPAY PAYOUT IF ELIGIBLE
    // =========================================================================
    if (autoPayEligible) {
      const feexResult = await executeFeexPayPayout({
        paymentMethod: String(paymentMethod).trim(),
        paymentDetails: String(paymentDetails).trim(),
        amountUsd: requestedAmount,
        reference,
        email: tenant.email,
      });

      if (feexResult.success && feexResult.status === 'SUCCESSFUL') {
        payout = await prisma.payoutRequest.update({
          where: { id: payout.id },
          data: {
            status: 'APPROVED',
            processedAt: new Date(),
            adminNote: `⚡ Virement Automatique FeexPay (${feexResult.amountXof} FCFA envoyés au ${feexResult.phoneNumber}) — Réf: ${feexResult.feexReference}`,
          },
        });

        // Notify Super Admin on Telegram
        sendTelegramNotification({
          title: `⚡ Auto-Payout FeexPay Exécuté — ${tenant.storeName || tenant.name}`,
          ticketCode: reference,
          type: 'ORDER',
          amount: `$${requestedAmount.toFixed(2)} USD (${feexResult.amountXof} FCFA)`,
          details: `Revendeur : ${tenant.name} (/store/${tenant.subdomain})\nMéthode : ${paymentMethod}\nNuméro crédité : ${feexResult.phoneNumber}\nRéf FeexPay : ${feexResult.feexReference}\nSolde restant : $${newWalletBalance.toFixed(2)} USD`,
        }).catch(console.error);

        // Notify Reseller on Telegram
        sendResellerTelegramNotification({
          tenantId: tenant.id,
          eventType: 'PAYOUT',
          title: `⚡ Retrait Payé Instantanément (${reference})`,
          ticketCode: reference,
          amount: `$${requestedAmount.toFixed(2)} USD (${feexResult.amountXof} FCFA)`,
          details: `✅ Votre retrait de $${requestedAmount.toFixed(2)} USD (${feexResult.amountXof} FCFA) a été envoyé automatiquement via FeexPay sur votre numéro ${feexResult.phoneNumber} !\nRéf Transaction : ${feexResult.feexReference}\nNouveau solde disponible : $${newWalletBalance.toFixed(2)} USD.`,
        }).catch(console.error);

        return NextResponse.json({
          success: true,
          autoPaid: true,
          payout,
          newWalletBalance,
          message: `⚡ Retrait ${reference} payé automatiquement ! ${feexResult.amountXof} FCFA ont été envoyés sur le ${feexResult.phoneNumber} via FeexPay.`,
        });
      } else {
        // FeexPay returned PENDING or temporary error: keep request safely in PENDING for 1-click Admin action
        manualReviewReason = `Transfert auto en attente (${feexResult.message})`;
      }
    }

    if (manualReviewReason) {
      payout = await prisma.payoutRequest.update({
        where: { id: payout.id },
        data: {
          adminNote: manualReviewReason,
        },
      });
    }

    // Notify Super Admin on Telegram for pending request
    sendTelegramNotification({
      title: `Demande de Retrait Revendeur — ${tenant.storeName || tenant.name}`,
      ticketCode: reference,
      type: 'REQUEST',
      amount: `$${requestedAmount.toFixed(2)} USD`,
      details: `Revendeur : ${tenant.name} (/store/${tenant.subdomain})\nMéthode : ${paymentMethod}\nCoordonnées : ${paymentDetails}\nInfo Auto-Payout : ${manualReviewReason || 'En attente'}\nSolde restant : $${newWalletBalance.toFixed(2)} USD`,
    }).catch(console.error);

    // Notify Reseller on Telegram
    sendResellerTelegramNotification({
      tenantId: tenant.id,
      eventType: 'PAYOUT',
      title: `Demande de retrait enregistrée (${reference})`,
      ticketCode: reference,
      amount: `$${requestedAmount.toFixed(2)} USD`,
      details: `Votre demande de retrait de $${requestedAmount.toFixed(2)} USD via ${paymentMethod} (${paymentDetails}) a bien été enregistrée.\nNouveau solde disponible : $${newWalletBalance.toFixed(2)} USD.`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      autoPaid: false,
      payout,
      newWalletBalance,
      message: `Demande de retrait ${reference} de $${requestedAmount.toFixed(2)} USD enregistrée ! (${manualReviewReason || 'Validation en cours'})`,
    });
  } catch (error: any) {
    console.error('Error creating payout request:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
