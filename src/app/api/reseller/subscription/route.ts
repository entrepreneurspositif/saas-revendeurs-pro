import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFeexPayConfig, convertUsdToXof } from '@/lib/feexpay';
import { initializeMonerooPayment } from '@/lib/moneroo';
import { sendTelegramNotification } from '@/lib/telegram';

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

    const plans = await prisma.saasPlan.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const formattedPlans = plans.map((p) => {
      let parsedFeatures: string[] = [];
      try {
        parsedFeatures = JSON.parse(p.features || '[]');
      } catch (e) {
        parsedFeatures = [];
      }
      return {
        ...p,
        features: parsedFeatures,
      };
    });

    return NextResponse.json({
      success: true,
      currentPlanId: tenant.planId,
      currentPlanStatus: tenant.planStatus,
      currentPlanExpiresAt: tenant.planExpiresAt,
      walletBalance: tenant.walletBalance,
      plans: formattedPlans,
    });
  } catch (error: any) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const { planId, billingInterval = 'monthly', paymentMethod } = body;

    if (!planId) {
      return NextResponse.json({ success: false, message: 'Identifiant de l\'offre requis' }, { status: 400 });
    }

    const targetPlan = await prisma.saasPlan.findUnique({
      where: { id: planId },
    });

    if (!targetPlan) {
      return NextResponse.json({ success: false, message: 'Offre introuvable' }, { status: 404 });
    }

    // 1. FREE PLAN ACTIVATION (Free, immediate)
    if (targetPlan.id === 'free') {
      const updated = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          planId: 'free',
          planStatus: 'ACTIVE',
          planExpiresAt: null,
        },
        include: { plan: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Votre boutique est désormais sur l\'offre Free.',
        plan: updated.plan,
      });
    }

    // 2. PAID PLAN ACTIVATION (Starter, Pro)
    const interval = billingInterval === 'yearly' ? 'yearly' : 'monthly';
    const priceUsd = interval === 'yearly' ? targetPlan.priceYearly : targetPlan.priceMonthly;
    const priceXof = Math.max(50, Math.round(priceUsd * 650));

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Veuillez sélectionner un moyen de règlement (Portefeuille, FeexPay ou Moneroo).' },
        { status: 400 }
      );
    }

    // A. WALLET BALANCE DEBIT
    if (paymentMethod === 'WALLET') {
      if (tenant.walletBalance < priceUsd) {
        return NextResponse.json(
          {
            success: false,
            message: `Solde insuffisant dans votre portefeuille. Solde disponible: $${tenant.walletBalance.toFixed(2)}, Montant requis: $${priceUsd.toFixed(2)}.`,
          },
          { status: 400 }
        );
      }

      const durationDays = interval === 'yearly' ? 365 : 30;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      const updated = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          walletBalance: { decrement: priceUsd },
          planId: targetPlan.id,
          planStatus: 'ACTIVE',
          planExpiresAt: expiresAt,
        },
        include: { plan: true },
      });

      sendTelegramNotification({
        title: `Abonnement Activé (Portefeuille)`,
        ticketCode: `SUB_WALLET_${tenant.id.slice(-6)}`,
        type: 'ORDER',
        amount: `$${priceUsd.toFixed(2)} USD`,
        details: `Le revendeur ${tenant.name} (${tenant.subdomain}) a activé l'offre ${targetPlan.name} (${interval === 'yearly' ? 'Annuel' : 'Mensuel'}) par débit de son portefeuille !`,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        message: `Félicitations ! L'offre ${targetPlan.name} (${interval === 'yearly' ? 'Annuelle' : 'Mensuelle'}) a été activée avec succès par débit de votre portefeuille.`,
        plan: updated.plan,
        walletBalance: updated.walletBalance,
      });
    }

    const ticketCode = `SUB_${tenant.id}_${targetPlan.id}_${interval}`;
    const host = req.headers.get('host') || '';
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://revente-abonnement.vercel.app').replace(/\/$/, '');
    const baseUrl = (host && !host.includes('localhost')) ? `https://${host}` : appUrl;

    // B. FEEXPAY GATEWAY
    if (paymentMethod === 'FEEXPAY') {
      const feexConfig = await getFeexPayConfig();
      if (!feexConfig.enabled) {
        return NextResponse.json({ success: false, message: 'Le paiement FeexPay est actuellement désactivé.' }, { status: 400 });
      }

      const callbackUrl = `${baseUrl}/api/feexpay/callback?custom_id=${encodeURIComponent(ticketCode)}&ticketCode=${encodeURIComponent(ticketCode)}`;
      const callbackErrorUrl = `${baseUrl}/api/feexpay/callback?custom_id=${encodeURIComponent(ticketCode)}&status=FAILED`;

      const feexPayRes = await fetch('https://api-v2.feexpay.me/api/feexlinks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${feexConfig.apiKey}`,
        },
        body: JSON.stringify({
          shop: feexConfig.shopId,
          amount: convertUsdToXof(priceUsd),
          description: `Abonnement ${targetPlan.name} ${interval === 'yearly' ? 'Annuel' : 'Mensuel'} - ${tenant.storeName}`.replace(/[^a-zA-Z0-9 _-]/g, ''),
          paymentMethod: 'ALL',
          expireIn: 60,
          range: 0,
          custom_id: ticketCode,
          callback_url: callbackUrl,
          callback_error: callbackErrorUrl,
        }),
      });

      const feexData = await feexPayRes.json().catch(() => ({}));
      const paymentUrl = feexData.urlPay || feexData.url;

      if (!feexPayRes.ok || !paymentUrl) {
        console.error('FeexPay Subscription Init Error:', feexData);
        return NextResponse.json(
          { success: false, message: feexData.message || 'Erreur lors de la génération du lien de paiement FeexPay.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        paymentUrl,
        ticketCode,
        message: 'Redirection vers FeexPay...',
      });
    }

    // C. MONEROO GATEWAY
    if (paymentMethod === 'MONEROO') {
      const returnUrl = `${baseUrl}/api/moneroo/callback?ticketCode=${encodeURIComponent(ticketCode)}`;

      const { checkoutUrl, paymentId } = await initializeMonerooPayment({
        amount: priceXof,
        currency: 'XOF',
        amountUsd: priceUsd,
        ticketCode,
        description: `Abonnement ${targetPlan.name} ${interval === 'yearly' ? 'Annuel' : 'Mensuel'} - ${tenant.storeName}`.replace(/[^a-zA-Z0-9 _-]/g, ''),
        customerEmail: tenant.email,
        customerName: tenant.name,
        returnUrl,
      });

      return NextResponse.json({
        success: true,
        paymentUrl: checkoutUrl,
        paymentId,
        ticketCode,
        message: 'Redirection vers Moneroo...',
      });
    }

    return NextResponse.json({ success: false, message: 'Moyen de paiement non supporté' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing subscription checkout:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
