import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, ticketCode, credentials, deliveredCredentials: customCreds } = body;

    if (!orderId && !ticketCode) {
      return NextResponse.json({ success: false, message: 'ID de commande ou code de ticket requis' }, { status: 400 });
    }

    const whereClause = orderId ? { id: orderId } : { ticketCode };
    const order = await prisma.order.findUnique({
      where: whereClause as any,
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

    if (!order) {
      return NextResponse.json({ success: false, message: 'Commande / Ticket non trouvé' }, { status: 404 });
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Ce ticket a déjà été validé et livré!' });
    }

    const suppProd = order.product?.activeSupplierProduct;

    // Handle Manual / Exclusive Products / Méthodes (Without automated third-party API supplier)
    if (!suppProd || !suppProd.supplier) {
      const isMethodOrAuto =
        order.product?.deliveryType === 'AUTOMATIC' ||
        order.product?.category === 'Méthode' ||
        Boolean(order.product?.methodContent);

      const inputCreds = credentials?.trim() || customCreds?.trim();
      const credentialsStr =
        inputCreds ||
        (isMethodOrAuto && order.product?.methodContent ? order.product.methodContent : null) ||
        'Produit exclusif validé par l\'administrateur. Vos accès vous ont été transmis.';

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          deliveredCredentials: credentialsStr,
        },
      });

      if (order.tenantId) {
        sendResellerTelegramNotification({
          tenantId: order.tenantId,
          eventType: 'NEW_ORDER',
          title: `Commande Exclusif Validée (${order.ticketCode})`,
          ticketCode: order.ticketCode,
          amount: `$${(order.totalAmount || order.unitSellingPrice || 0).toFixed(2)} USD`,
          resellerProfit: `$${(order.resellerProfit || 0).toFixed(2)} USD`,
          details: `Produit Exclusif : ${order.productTitle || order.product?.title || 'Article VIP'}\nStatut : Validé avec succès par le Super Admin !`,
        }).catch((err) => console.error('Reseller Telegram notification error:', err));
      }

      return NextResponse.json({
        success: true,
        orderId: updatedOrder.id,
        ticketCode: updatedOrder.ticketCode,
        deliveredCredentials: credentialsStr,
        message: 'Paiement validé avec succès ! Commande du produit exclusif approuvée.',
      });
    }

    const supplier = suppProd.supplier;

    // Trigger supplier purchase via driver
    const driver = createSupplierDriver(supplier);
    const purchaseRes = await driver.purchase({
      productId: suppProd.externalId,
      quantity: order.quantity,
      idempotencyKey: order.idempotencyKey || `ord-${Date.now()}`,
    });

    if (!purchaseRes.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          errorMessage: purchaseRes.message || 'Échec de commande fournisseur',
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: `Échec d'achat fournisseur (${supplier.name}): ${purchaseRes.message}`,
        },
        { status: 500 }
      );
    }

    const credentialsStr = typeof purchaseRes.deliveredCredentials === 'object'
      ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
      : String(purchaseRes.deliveredCredentials || 'Livré avec succès');

    // Update order status to COMPLETED and save credentials
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        deliveredCredentials: credentialsStr,
        supplierOrderRef: purchaseRes.orderRef,
      },
    });

    // Update stock
    await prisma.supplierProduct.update({
      where: { id: suppProd.id },
      data: {
        stock: { decrement: order.quantity },
        sold: { increment: order.quantity },
      },
    });

    if (order.tenantId) {
      sendResellerTelegramNotification({
        tenantId: order.tenantId,
        eventType: 'NEW_ORDER',
        title: `Commande Validée & Livrée (${order.ticketCode})`,
        ticketCode: order.ticketCode,
        amount: `$${(order.totalAmount || order.unitSellingPrice || 0).toFixed(2)} USD`,
        resellerProfit: `$${(order.resellerProfit || 0).toFixed(2)} USD`,
        details: `Produit : ${order.productTitle || order.product?.title || 'Abonnement'}\nStatut : Validé et livré avec succès par le Super Admin !`,
      }).catch((err) => console.error('Reseller Telegram notification error:', err));
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      ticketCode: updatedOrder.ticketCode,
      deliveredCredentials: credentialsStr,
      message: `Paiement validé avec succès ! Commande exécutée automatiquement auprès du fournisseur (${supplier.name}).`,
    });
  } catch (error: any) {
    console.error('Ticket validation error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
