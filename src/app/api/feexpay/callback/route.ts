import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { sendTelegramNotification, sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function extractTicketCode(data: any): string {
  const direct =
    data.custom_id ||
    data.customId ||
    data.custom_info ||
    data.customInfo ||
    data.ticketCode ||
    data.ticket_code ||
    data.order_id ||
    data.orderId ||
    data.reference ||
    data.ref ||
    '';

  if (direct && String(direct).trim()) {
    const cleanDirect = String(direct).trim();
    if (/^(TK|OTP)-[\w-]+$/i.test(cleanDirect) || /^SUB_[\w-]+$/i.test(cleanDirect)) {
      return cleanDirect;
    }
  }

  const jsonStr = JSON.stringify(data || {});
  const match = jsonStr.match(/(TK-[A-Z0-9]+|OTP-[A-Z0-9]+|SUB_[A-Za-z0-9_]+)/i);
  if (match) {
    return match[0];
  }

  return String(direct).trim();
}

function isBrowserRequest(req: NextRequest): boolean {
  const accept = req.headers.get('accept') || '';
  const secFetchDest = req.headers.get('sec-fetch-dest') || '';
  const userAgent = req.headers.get('user-agent') || '';

  return (
    req.method === 'GET' ||
    accept.includes('text/html') ||
    secFetchDest === 'document' ||
    /mozilla|chrome|safari|iphone|android|edge/i.test(userAgent)
  );
}

async function processCallback(req: NextRequest) {
  const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const isBrowser = isBrowserRequest(req);

  // 1. Gather all data sources (URL searchParams, JSON body, FormData)
  const data: Record<string, any> = {};

  // URL parameters
  const url = new URL(req.url);
  url.searchParams.forEach((value, key) => {
    data[key] = value;
  });

  // Body data
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const jsonBody = await req.json().catch(() => ({}));
      Object.assign(data, jsonBody);
    } else if (contentType.includes('form') || contentType.includes('multipart')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((value, key) => {
          data[key] = value;
        });
      }
    } else {
      // Try raw json fallback
      const jsonBody = await req.json().catch(() => ({}));
      Object.assign(data, jsonBody);
    }
  }

  const ticketCode = extractTicketCode(data);

  const rawStatus = String(
    data.status || data.transaction_status || data.state || ''
  ).toUpperCase();
  const isSuccessful =
    rawStatus === 'SUCCESS' ||
    rawStatus === 'SUCCESSFUL' ||
    rawStatus === 'PAID' ||
    rawStatus === 'COMPLETED' ||
    rawStatus === 'APPROVED' ||
    rawStatus === '200' ||
    data.status === true ||
    !rawStatus; // On browser redirect, treat as successful completion if status is unspecified

  if (!ticketCode) {
    if (isBrowser) {
      return NextResponse.redirect(`${baseUrl}/?lookup=true`);
    }
    return NextResponse.json({ success: false, message: 'Identifiant ticket manquant' }, { status: 400 });
  }

  // 2. CHECK STANDARD PRODUCT ORDER
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ ticketCode }, { id: ticketCode }],
    },
    include: {
      product: {
        include: {
          activeSupplierProduct: {
            include: { supplier: true },
          },
        },
      },
    },
  });

  if (order) {
    if (order.status !== 'COMPLETED' && isSuccessful) {
      const suppProd = order.product?.activeSupplierProduct;
      let deliveredCredentialsText = '';

      if (suppProd && suppProd.supplier && suppProd.supplier.isActive) {
        const supplier = suppProd.supplier;
        const driver = createSupplierDriver(supplier);

        const purchaseRes = await driver.purchase({
          productId: suppProd.externalId,
          quantity: order.quantity,
          idempotencyKey: order.idempotencyKey || `ord-feexpay-${Date.now()}`,
        });

        if (purchaseRes.success) {
          const creds =
            typeof purchaseRes.deliveredCredentials === 'object'
              ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
              : String(purchaseRes.deliveredCredentials || 'Livré avec succès via FeexPay');

          deliveredCredentialsText = creds;

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'COMPLETED',
              deliveredCredentials: creds,
              supplierOrderRef: purchaseRes.orderRef,
            },
          });

          await prisma.supplierProduct.update({
            where: { id: suppProd.id },
            data: {
              stock: { decrement: order.quantity },
              sold: { increment: order.quantity },
            },
          });
        } else {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PENDING_PAYMENT',
              errorMessage: `Paiement FeexPay reçu mais erreur fournisseur: ${purchaseRes.message}`,
            },
          });
        }
      } else {
        // Exclusive product or automated Method
        const isMethodOrAuto =
          order.product?.deliveryType === 'AUTOMATIC' ||
          order.product?.category === 'Méthode' ||
          Boolean(order.product?.methodContent);

        const autoCreds =
          isMethodOrAuto && order.product?.methodContent
            ? order.product.methodContent
            : isMethodOrAuto
            ? 'Méthode validée avec succès. Vos accès ont été débloqués.'
            : 'Produit exclusif validé. Vos accès vous seront transmis.';

        deliveredCredentialsText = autoCreds;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            deliveredCredentials: autoCreds,
          },
        });
      }

      // Credit Reseller Wallet with sales commission
      if (order.tenantId && order.resellerProfit > 0) {
        try {
          await prisma.tenant.update({
            where: { id: order.tenantId },
            data: {
              walletBalance: { increment: order.resellerProfit },
              totalEarnings: { increment: order.resellerProfit },
            },
          });

          sendResellerTelegramNotification({
            tenantId: order.tenantId,
            type: 'NEW_ORDER',
            title: `Nouvelle Vente : ${order.productTitle}`,
            ticketCode: order.ticketCode,
            amount: `$${order.totalAmount.toFixed(2)} USD`,
            resellerProfit: `+$${order.resellerProfit.toFixed(2)} USD`,
            details: `Paiement FeexPay validé avec succès !\nVotre commission nette (+${order.resellerProfit.toFixed(2)} USD) a été créditée sur votre portefeuille.`,
          }).catch(console.error);
        } catch (e) {
          console.error('Error crediting reseller wallet on FeexPay callback:', e);
        }
      }

      sendTelegramNotification({
        title: `Paiement FeexPay Reçu — ${order.productTitle}`,
        ticketCode: order.ticketCode,
        type: 'ORDER',
        amount: `$${order.totalAmount.toFixed(2)} USD`,
        details: `Paiement automatique FeexPay validé avec succès !\nStatut : Livré et exécuté.`,
      }).catch(console.error);
    }

    if (isBrowser) {
      if (order.tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: order.tenantId },
          select: { subdomain: true },
        });
        if (tenant?.subdomain) {
          return NextResponse.redirect(`${baseUrl}/store/${tenant.subdomain}?lookup=true&code=${encodeURIComponent(order.ticketCode)}&paid=true`);
        }
      }
      return NextResponse.redirect(`${baseUrl}/?ticket=${encodeURIComponent(order.ticketCode)}&paid=true`);
    }

    return NextResponse.json({
      success: true,
      message: `Paiement FeexPay validé et commande ${order.ticketCode} exécutée !`,
    });
  }

  // 3. CHECK OTP ORDER
  const otpOrder = await prisma.otpOrder.findFirst({
    where: {
      OR: [{ ticketCode: ticketCode.toUpperCase() }, { id: ticketCode }],
    },
  });

  if (otpOrder) {
    if (otpOrder.status === 'PENDING_PAYMENT' && isSuccessful) {
      await prisma.otpOrder.update({
        where: { id: otpOrder.id },
        data: { status: 'WAITING_SMS' },
      });

      // Credit Reseller Wallet for OTP sales commission
      if (otpOrder.tenantId) {
        const otpProfit = Math.max(0, otpOrder.sellingPrice - (otpOrder.costPrice || 0));
        if (otpProfit > 0) {
          try {
            await prisma.tenant.update({
              where: { id: otpOrder.tenantId },
              data: {
                walletBalance: { increment: otpProfit },
                totalEarnings: { increment: otpProfit },
              },
            });

            sendResellerTelegramNotification({
              tenantId: otpOrder.tenantId,
              type: 'NEW_OTP',
              title: `Vente Numéro OTP SMS (${otpOrder.service.toUpperCase()})`,
              ticketCode: otpOrder.ticketCode,
              amount: `$${otpOrder.sellingPrice.toFixed(2)} USD`,
              resellerProfit: `+$${otpProfit.toFixed(2)} USD`,
              details: `Paiement FeexPay validé ! Numéro OTP : ${otpOrder.phone || 'En cours de réception'}.\nVotre commission nette (+${otpProfit.toFixed(2)} USD) a été créditée sur votre portefeuille.`,
            }).catch(console.error);
          } catch (e) {
            console.error('Error crediting reseller wallet on OTP FeexPay callback:', e);
          }
        }
      }

      sendTelegramNotification({
        title: `Paiement FeexPay Reçu — OTP ${otpOrder.service.toUpperCase()}`,
        ticketCode: otpOrder.ticketCode,
        type: 'OTP',
        amount: `$${otpOrder.sellingPrice.toFixed(2)} USD`,
        details: `Paiement automatique FeexPay validé ! En attente de réception du SMS.`,
      }).catch(console.error);
    }

    if (isBrowser) {
      if (otpOrder.tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: otpOrder.tenantId },
          select: { subdomain: true },
        });
        if (tenant?.subdomain) {
          return NextResponse.redirect(`${baseUrl}/store/${tenant.subdomain}?lookup=true&code=${encodeURIComponent(otpOrder.ticketCode)}&paid=true`);
        }
      }
      return NextResponse.redirect(`${baseUrl}/otp?ticket=${encodeURIComponent(otpOrder.ticketCode)}&paid=true`);
    }

    return NextResponse.json({
      success: true,
      message: `Paiement FeexPay validé pour le ticket OTP ${otpOrder.ticketCode}!`,
    });
  }

  // 4. CHECK SAAS SUBSCRIPTION PAYMENT (SUB_<tenantId>_<planId>_<interval>)
  if (ticketCode && ticketCode.startsWith('SUB_')) {
    const parts = ticketCode.split('_');
    const tenantId = parts[1];
    const planId = parts[2];
    const interval = parts[3] || 'monthly';

    if (tenantId && planId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const plan = await prisma.saasPlan.findUnique({ where: { id: planId } });

      if (tenant && plan) {
        if (isSuccessful) {
          const durationDays = interval === 'yearly' ? 365 : 30;
          const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              planId: plan.id,
              planStatus: 'ACTIVE',
              planExpiresAt: expiresAt,
            },
          });

          sendTelegramNotification({
            title: `Abonnement Revendeur Activé (FeexPay)`,
            ticketCode: ticketCode,
            type: 'ORDER',
            amount: `$${(interval === 'yearly' ? plan.priceYearly : plan.priceMonthly).toFixed(2)} USD`,
            details: `Le revendeur ${tenant.name} (${tenant.subdomain}) a validé son paiement pour l'offre ${plan.name} (${interval === 'yearly' ? 'Annuel' : 'Mensuel'}) !`,
          }).catch(console.error);
        }

        if (isBrowser) {
          return NextResponse.redirect(`${baseUrl}/reseller/dashboard?tab=subscription&activated=true&plan=${encodeURIComponent(plan.name)}`);
        }

        return NextResponse.json({
          success: true,
          message: `Abonnement ${plan.name} activé avec succès pour le revendeur ${tenant.name}`,
        });
      }
    }
  }

  if (isBrowser) {
    return NextResponse.redirect(`${baseUrl}/?ticket=${encodeURIComponent(ticketCode)}&paid=true`);
  }

  return NextResponse.json({ success: false, message: 'Ticket non trouvé dans la base' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    return await processCallback(req);
  } catch (error: any) {
    console.error('FeexPay Callback POST Error:', error);
    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    if (isBrowserRequest(req)) {
      return NextResponse.redirect(`${protocol}://${host}/?error=callback_failed`);
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    return await processCallback(req);
  } catch (error: any) {
    console.error('FeexPay Callback GET Error:', error);
    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/?error=callback_failed`);
  }
}
