import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const { orderId, ticketCode, manualCredentials } = await req.json();

    if (!orderId && !ticketCode) {
      return NextResponse.json(
        { success: false, message: 'ID de commande ou code ticket requis' },
        { status: 400 }
      );
    }

    const whereClause: any = orderId ? { id: orderId } : { ticketCode };

    const order = await prisma.order.findUnique({
      where: whereClause,
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
      return NextResponse.json({ success: false, message: 'Ticket introuvable' }, { status: 404 });
    }

    // Verify ownership: only the reseller who owns this store can validate it!
    if (order.tenantId !== sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'êtes pas autorisé à valider ce ticket' },
        { status: 403 }
      );
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        message: 'Ce ticket a déjà été validé et livré !',
        deliveredCredentials: order.deliveredCredentials,
      });
    }

    let credentialsStr = '';
    let supplierRef: string | null = null;
    let suppProd = order.product?.activeSupplierProduct;
    let supplierName = 'Fournisseur direct';

    if (manualCredentials && typeof manualCredentials === 'string' && manualCredentials.trim()) {
      // Reseller manually provided the delivered credentials
      credentialsStr = manualCredentials.trim();
    } else {
      // Automated supplier purchase
      if (!suppProd || !suppProd.supplier) {
        return NextResponse.json(
          { success: false, message: 'Aucun fournisseur actif configuré pour ce produit. Vous pouvez toutefois saisir les identifiants manuellement pour valider le ticket.' },
          { status: 400 }
        );
      }

      const supplier = suppProd.supplier;
      supplierName = supplier.name;

      // Trigger purchase from supplier
      const driver = createSupplierDriver(supplier);
      const purchaseRes = await driver.purchase({
        productId: suppProd.externalId,
        quantity: order.quantity,
        idempotencyKey: order.idempotencyKey || `ord-val-${Date.now()}`,
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
            message: `Échec d'achat auprès du fournisseur (${supplier.name}): ${purchaseRes.message}. Vous pouvez saisir les identifiants manuellement si vous disposez d'un compte de remplacement.`,
          },
          { status: 500 }
        );
      }

      credentialsStr =
        typeof purchaseRes.deliveredCredentials === 'object'
          ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
          : String(purchaseRes.deliveredCredentials || 'Livré avec succès');
      supplierRef = purchaseRes.orderRef || null;
    }

    // Update order status to COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        deliveredCredentials: credentialsStr,
        supplierOrderRef: supplierRef,
      },
    });

    // Credit reseller profit to their wallet
    if (order.resellerProfit > 0) {
      await prisma.tenant.update({
        where: { id: sessionToken },
        data: {
          walletBalance: { increment: order.resellerProfit },
          totalEarnings: { increment: order.resellerProfit },
        },
      });
    }

    // Decrement supplier stock if supplier product exists
    if (suppProd?.id) {
      await prisma.supplierProduct.update({
        where: { id: suppProd.id },
        data: {
          stock: { decrement: order.quantity },
          sold: { increment: order.quantity },
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      ticketCode: updatedOrder.ticketCode,
      deliveredCredentials: credentialsStr,
      profitCredited: order.resellerProfit,
      message: `Ticket validé avec succès ! Les identifiants ont été assignés (${supplierName}) et votre bénéfice (+${order.resellerProfit.toFixed(2)}$) a été crédité.`,
    });
  } catch (error: any) {
    console.error('Error validating reseller ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
