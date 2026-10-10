import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { sendTelegramNotification } from '@/lib/telegram';

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
    data.crypted_data ||
    data.transaction_id ||
    '';

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

  const data: Record<string, any> = {};

  const url = new URL(req.url);
  url.searchParams.forEach((value, key) => {
    data[key] = value;
  });

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
      const jsonBody = await req.json().catch(() => ({}));
      Object.assign(data, jsonBody);
    }
  }

  const ticketCode = extractTicketCode(data);

  const rawStatus = String(
    data.status || data.transaction_status || data.code || data.state || ''
  ).toUpperCase();
  const isSuccessful =
    rawStatus === 'SUCCESS' ||
    rawStatus === 'SUCCESSFUL' ||
    rawStatus === 'PAID' ||
    rawStatus === 'ACCEPTED' ||
    rawStatus === 'COMPLETED' ||
    rawStatus === 'APPROVED' ||
    rawStatus === '00' ||
    rawStatus === '200' ||
    data.status === true ||
    !rawStatus;

  if (!ticketCode) {
    if (isBrowser) {
      return NextResponse.redirect(`${baseUrl}/?lookup=true`);
    }
    return NextResponse.json({ success: false, message: 'Identifiant ticket manquant' }, { status: 400 });
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

      if (suppProd && suppProd.supplier && suppProd.supplier.isActive) {
        const supplier = suppProd.supplier;
        const driver = createSupplierDriver(supplier);

        const purchaseRes = await driver.purchase({
          productId: suppProd.externalId,
          quantity: order.quantity,
          idempotencyKey: order.idempotencyKey || `ord-gateway-${Date.now()}`,
        });

        if (purchaseRes.success) {
          const creds =
            typeof purchaseRes.deliveredCredentials === 'object'
              ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
              : String(purchaseRes.deliveredCredentials || 'Livré avec succès via Passerelle Partenaire');

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
              errorMessage: `Paiement Passerelle reçu mais erreur fournisseur: ${purchaseRes.message}`,
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

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            deliveredCredentials: autoCreds,
          },
        });
      }

      sendTelegramNotification({
        title: `Paiement Passerelle Reçu — ${order.productTitle}`,
        ticketCode: order.ticketCode,
        type: 'ORDER',
        amount: `$${order.totalAmount.toFixed(2)} USD`,
        details: `Paiement automatique via Passerelle Partenaire validé !\nStatut : Livré et exécuté.`,
      }).catch(console.error);
    }

    if (isBrowser) {
      return NextResponse.redirect(`${baseUrl}/?ticket=${encodeURIComponent(order.ticketCode)}&paid=true`);
    }

    return NextResponse.json({
      success: true,
      message: `Paiement validé et commande ${order.ticketCode} exécutée !`,
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
        title: `Paiement Passerelle Reçu — OTP ${otpOrder.service.toUpperCase()}`,
        ticketCode: otpOrder.ticketCode,
        type: 'OTP',
        amount: `$${otpOrder.sellingPrice.toFixed(2)} USD`,
        details: `Paiement automatique via Passerelle Partenaire validé ! En attente de SMS.`,
      }).catch(console.error);
    }

    if (isBrowser) {
      return NextResponse.redirect(`${baseUrl}/otp?ticket=${encodeURIComponent(otpOrder.ticketCode)}&paid=true`);
    }

    return NextResponse.json({
      success: true,
      message: `Paiement validé pour le ticket OTP ${otpOrder.ticketCode}!`,
    });
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
    console.error('Custom Gateway Callback POST Error:', error);
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
    console.error('Custom Gateway Callback GET Error:', error);
    const host = req.headers.get('host') || 'revente-abonnement.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/?error=callback_failed`);
  }
}
