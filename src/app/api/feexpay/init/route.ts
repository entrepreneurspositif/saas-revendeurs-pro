import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFeexPayConfig, convertUsdToXof } from '@/lib/feexpay';

export const dynamic = 'force-dynamic';

function sanitizeDescription(str: string, ticketCode: string): string {
  const base = (str || 'Commande')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9 _-]/g, '') // Keep letters, numbers, spaces, _ and -
    .replace(/\s+/g, ' ')            // Collapse extra spaces
    .trim();
  return `${base} ${ticketCode}`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode } = body;

    if (!ticketCode) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const config = await getFeexPayConfig();

    // Check standard product order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ ticketCode }, { id: ticketCode }],
      },
    });

    let amountUsd = 0;
    let rawDescription = '';
    let targetTenantId = order?.tenantId || null;

    if (order) {
      amountUsd = order.totalAmount;
      rawDescription = `Achat ${order.productTitle}`;
    } else {
      // Check OTP order
      const otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
        },
      });

      if (otpOrder) {
        amountUsd = otpOrder.sellingPrice;
        rawDescription = `Commande SMS OTP ${otpOrder.service.toUpperCase()}`;
        targetTenantId = otpOrder.tenantId || null;
      } else {
        return NextResponse.json({ success: false, message: 'Ticket non trouvé' }, { status: 404 });
      }
    }

    // Dynamic Gateway Resolution: Check if Reseller has configured their own FeexPay API Keys
    let feexApiKey = config.apiKey;
    let feexShopId = config.shopId;
    let tenantSubdomain = '';

    if (targetTenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: targetTenantId },
        select: {
          id: true,
          subdomain: true,
          customGatewayEnabled: true,
          feexpayApiKey: true,
          feexpayShopId: true,
          feexpayEnabled: true,
        },
      });

      if (tenant) {
        tenantSubdomain = tenant.subdomain;
        if (
          tenant.customGatewayEnabled &&
          tenant.feexpayEnabled &&
          tenant.feexpayApiKey &&
          tenant.feexpayShopId
        ) {
          // Dynamic Seller Gateway in action
          feexApiKey = tenant.feexpayApiKey.trim();
          feexShopId = tenant.feexpayShopId.trim();
        }
      }
    }

    // If using super admin fallback and super admin has disabled FeexPay:
    if (feexApiKey === config.apiKey && !config.enabled) {
      return NextResponse.json(
        { success: false, message: 'Le paiement par FeexPay est actuellement désactivé.' },
        { status: 400 }
      );
    }

    const amountXof = convertUsdToXof(amountUsd);
    const description = sanitizeDescription(rawDescription, ticketCode);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://revente-abonnement.vercel.app').replace(/\/$/, '');
    const host = req.headers.get('host') || '';
    const baseUrl = (host && !host.includes('localhost')) ? `https://${host}` : appUrl;
    const subdomainParam = tenantSubdomain ? `&subdomain=${encodeURIComponent(tenantSubdomain)}` : '';
    const callbackUrl = `${baseUrl}/api/feexpay/callback?custom_id=${encodeURIComponent(ticketCode)}&ticketCode=${encodeURIComponent(ticketCode)}${subdomainParam}`;
    const callbackErrorUrl = `${baseUrl}/api/feexpay/callback?custom_id=${encodeURIComponent(ticketCode)}&status=FAILED${subdomainParam}`;

    // Call FeexPay V2 API to generate payment link
    const feexPayRes = await fetch('https://api-v2.feexpay.me/api/feexlinks/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${feexApiKey}`,
      },
      body: JSON.stringify({
        shop: feexShopId,
        amount: amountXof,
        description,
        paymentMethod: 'ALL',
        expireIn: 60,
        range: 0,
        custom_id: ticketCode,
        callback_url: callbackUrl,
        callback_error: callbackErrorUrl,
      }),
    });

    const data = await feexPayRes.json().catch(() => ({}));

    if (!feexPayRes.ok || (!data.urlPay && !data.url)) {
      console.error('FeexPay API V2 Error:', data);

      let errorMsg = data.message || 'Erreur lors de la génération du lien de paiement FeexPay';
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const errorDetails = data.errors
          .map((e: any) => (e.constraints ? Object.values(e.constraints).join(', ') : ''))
          .filter(Boolean)
          .join(' | ');
        if (errorDetails) {
          errorMsg = `Erreur FeexPay: ${errorDetails}`;
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMsg,
          details: data,
        },
        { status: 400 }
      );
    }

    const checkoutUrl = data.urlPay || data.url;

    return NextResponse.json({
      success: true,
      ticketCode,
      amountUSD: amountUsd,
      amountXOF: amountXof,
      description,
      shopId: config.shopId,
      apiKey: config.apiKey,
      callbackUrl,
      paymentUrl: checkoutUrl,
      message: 'Paramètres de paiement FeexPay générés avec succès.',
    });
  } catch (error: any) {
    console.error('FeexPay Init Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
