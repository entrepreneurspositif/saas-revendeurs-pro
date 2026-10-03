import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

async function handleCallback(data: any) {
  const customId = String(
    data.custom_id || data.customId || data.ticketCode || data.ticket_code || data.reference || ''
  ).trim();

  const rawStatus = String(data.status || data.transaction_status || '').toUpperCase();
  const isSuccessful =
    rawStatus === 'SUCCESS' ||
    rawStatus === 'SUCCESSFUL' ||
    rawStatus === 'PAID' ||
    rawStatus === 'COMPLETED' ||
    rawStatus === 'APPROVED' ||
    rawStatus === '200' ||
    data.status === true;

  if (!customId) {
    return NextResponse.json({ success: false, message: 'Identifiant custom_id manquant' }, { status: 400 });
  }

  if (!isSuccessful) {
    return NextResponse.json({ success: true, message: 'Paiement non finalisé ou en attente' });
  }

  // 1. CHECK STANDARD PRODUCT ORDER
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ ticketCode: customId }, { id: customId }],
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
    if (order.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Commande déjà livrée.' });
    }

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

    return NextResponse.json({
      success: true,
      message: `Paiement FeexPay validé et commande ${order.ticketCode} exécutée !`,
    });
  }

  // 2. CHECK OTP ORDER
  const otpOrder = await prisma.otpOrder.findFirst({
    where: {
      OR: [{ ticketCode: customId.toUpperCase() }, { id: customId }],
    },
  });

  if (otpOrder) {
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

    return NextResponse.json({
      success: true,
      message: `Paiement FeexPay validé pour le ticket OTP ${otpOrder.ticketCode}!`,
    });
  }

  return NextResponse.json({ success: false, message: 'Ticket non trouvé dans la base' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return await handleCallback(body);
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

    return await handleCallback(queryParams);
  } catch (error: any) {
    console.error('FeexPay Callback GET Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
