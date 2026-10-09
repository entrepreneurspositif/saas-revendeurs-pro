import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMonerooConfig, initializeMonerooPayment } from '@/lib/moneroo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode } = body;

    if (!ticketCode) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const config = await getMonerooConfig();

    // Look up standard product order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ ticketCode }, { id: ticketCode }],
      },
      include: {
        user: true,
      },
    });

    let amountUsd = 0;
    let description = '';
    let customerEmail = '';
    let customerName = '';
    let targetTenantId = order?.tenantId || null;

    if (order) {
      amountUsd = order.totalAmount;
      description = `Achat ${order.productTitle}`;
      customerEmail = order.user?.email || 'client@revente-abonnement.com';
      customerName = order.user?.name || 'Client Reseller';
    } else {
      // Look up OTP order
      const otpOrder = await prisma.otpOrder.findFirst({
        where: {
          OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
        },
      });

      if (otpOrder) {
        amountUsd = otpOrder.sellingPrice;
        description = `Commande SMS OTP ${otpOrder.service.toUpperCase()}`;
        customerEmail = otpOrder.customerEmail || 'client@revente-abonnement.com';
        customerName = otpOrder.customerName || 'Client OTP';
        targetTenantId = otpOrder.tenantId || null;
      } else {
        return NextResponse.json({ success: false, message: 'Ticket non trouvé' }, { status: 404 });
      }
    }

    // Dynamic Gateway Resolution for Moneroo
    let overrideSecretKey: string | undefined = undefined;
    let tenantSubdomain = '';

    if (targetTenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: targetTenantId },
        select: {
          id: true,
          subdomain: true,
          customGatewayEnabled: true,
          monerooSecretKey: true,
          monerooEnabled: true,
        },
      });

      if (tenant) {
        tenantSubdomain = tenant.subdomain;
        if (
          tenant.customGatewayEnabled &&
          tenant.monerooEnabled &&
          tenant.monerooSecretKey
        ) {
          overrideSecretKey = tenant.monerooSecretKey.trim();
        }
      }
    }

    // Fallback: If using platform super admin gateway and it is disabled:
    if (!overrideSecretKey && !config.enabled) {
      return NextResponse.json(
        { success: false, message: 'Le paiement par Moneroo est actuellement désactivé.' },
        { status: 400 }
      );
    }

    // Convert price to FCFA / XOF for Moneroo
    const amountXof = Math.max(50, Math.round((amountUsd || 0) * 650));

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://revente-abonnement.vercel.app').replace(/\/$/, '');
    const host = req.headers.get('host') || '';
    const baseUrl = (host && !host.includes('localhost')) ? `https://${host}` : appUrl;
    const subdomainParam = tenantSubdomain ? `&subdomain=${encodeURIComponent(tenantSubdomain)}` : '';
    const returnUrl = `${baseUrl}/api/moneroo/callback?ticketCode=${encodeURIComponent(ticketCode)}${subdomainParam}`;

    const { checkoutUrl, paymentId } = await initializeMonerooPayment({
      amount: amountXof,
      currency: 'XOF',
      amountUsd,
      ticketCode,
      description,
      customerEmail,
      customerName,
      returnUrl,
      overrideSecretKey,
    });

    return NextResponse.json({
      success: true,
      ticketCode,
      amountUSD: amountUsd,
      amountXOF: amountXof,
      paymentId,
      paymentUrl: checkoutUrl,
      message: 'Paiement Moneroo (FCFA) initialisé avec succès.',
    });
  } catch (error: any) {
    console.error('Moneroo Init Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
