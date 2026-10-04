import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function extractTicketCode(data: any): string {
  const direct = data.custom_id || data.customId || data.custom_info || data.customInfo ||
                 data.ticketCode || data.ticket_code || data.order_id || data.orderId ||
                 data.reference || data.ref || '';

  if (direct && String(direct).trim()) {
    const cleanDirect = String(direct).trim();
    if (/^TK-[\w-]+$/i.test(cleanDirect)) {
      return cleanDirect;
    }
  }

  const jsonStr = JSON.stringify(data || {});
  const match = jsonStr.match(/TK-[A-Z0-9]+/i);
  if (match) {
    return match[0].toUpperCase();
  }

  return String(direct).trim();
}

async function handleCallback(data: any, isBrowserGet: boolean = false, host: string = '') {
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
    !rawStatus; // If redirected from FeexPay without explicit status, process as completed

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = host ? `${protocol}://${host}` : 'https://revente-abonnement.vercel.app';

  if (!ticketCode) {
    if (isBrowserGet) {
      return NextResponse.redirect(`${baseUrl}/?error=custom_id_missing`);
    }
    return NextResponse.json({ success: false, message: 'Identifiant custom_id manquant' }, { status: 400 });
  }

  // 1. CHECK STANDARD PRODUCT ORDER
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
          const creds = typeof purchaseRes.deliveredCredentials === 'object'
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
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
      }

      sendTelegramNotification({
        title: `Paiement FeexPay Reçu — ${order.productTitle}`,
        ticketCode: order.ticketCode,
        type: 'ORDER',
        amount: `$${order.totalAmount.toFixed(2)} USD`,
        details: `Paiement automatique FeexPay validé avec succès !\nStatut : Livré et exécuté.`,
      }).catch(console.error);
    }

    if (isBrowserGet) {
      return NextResponse.redirect(`${baseUrl}/?ticket=${encodeURIComponent(order.ticketCode)}&paid=true`);
    }

    return NextResponse.json({
      success: true,
      message: `Paiement FeexPay validé et commande ${order.ticketCode} exécutée !`,
    });
  }

  // 2. CHECK OTP ORDER
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

      sendTelegramNotification({
        title: `Paiement FeexPay Reçu — OTP ${otpOrder.service.toUpperCase()}`,
        ticketCode: otpOrder.ticketCode,
        type: 'OTP',
        amount: `$${otpOrder.sellingPrice.toFixed(2)} USD`,
        details: `Paiement automatique FeexPay validé ! En attente de réception du SMS.`,
      }).catch(console.error);
    }

    if (isBrowserGet) {
      return NextResponse.redirect(`${baseUrl}/otp?ticket=${encodeURIComponent(otpOrder.ticketCode)}&paid=true`);
    }

    return NextResponse.json({
      success: true,
      message: `Paiement FeexPay validé pour le ticket OTP ${otpOrder.ticketCode}!`,
    });
  }

  if (isBrowserGet) {
    return NextResponse.redirect(`${baseUrl}/?error=ticket_not_found`);
  }

  return NextResponse.json({ success: false, message: 'Ticket non trouvé dans la base' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    return await handleCallback(body, false, host);
  } catch (error: any) {
    console.error('FeexPay Callback POST Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    return await handleCallback(queryParams, true, host);
  } catch (error: any) {
    console.error('FeexPay Callback GET Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
