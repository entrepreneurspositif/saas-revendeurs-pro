import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity = 1, customerAccounts, userId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID du produit requis' }, { status: 400 });
    }

    const userEmail = userId || 'client@example.com';
    let user = await prisma.user.findFirst({
      where: { OR: [{ id: userEmail }, { email: userEmail }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'client@example.com',
          name: 'Jean Dupont',
          role: 'CUSTOMER',
          walletBalance: 250.0,
        },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        activeSupplierProduct: {
          include: { supplier: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Produit non trouvé' }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ce produit est actuellement désactivé par l\'administrateur.' },
        { status: 400 }
      );
    }

    const suppProd = product.activeSupplierProduct;
    if (!suppProd || !suppProd.supplier) {
      return NextResponse.json(
        { success: false, message: 'Aucun fournisseur actif configuré pour ce produit.' },
        { status: 400 }
      );
    }

    const supplier = suppProd.supplier;
    if (!supplier.isActive) {
      return NextResponse.json(
        { success: false, message: `Le fournisseur (${supplier.name}) est actuellement désactivé.` },
        { status: 400 }
      );
    }

    if (suppProd.stock < quantity) {
      return NextResponse.json(
        { success: false, message: `Stock insuffisant chez le fournisseur (Disponible: ${suppProd.stock})` },
        { status: 400 }
      );
    }

    const unitSellingPrice = product.sellingPrice;
    const totalSellingPrice = unitSellingPrice * quantity;
    const unitCostPrice = suppProd.costPrice;
    const totalCostPrice = unitCostPrice * quantity;
    const totalProfitMargin = parseFloat((totalSellingPrice - totalCostPrice).toFixed(2));

    if (user.walletBalance < totalSellingPrice) {
      return NextResponse.json(
        {
          success: false,
          message: `Solde insuffisant ($${user.walletBalance.toFixed(2)}). Prix requis: $${totalSellingPrice.toFixed(2)}. Veuillez recharger votre solde.`,
        },
        { status: 400 }
      );
    }

    const idempotencyKey = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const driver = createSupplierDriver(supplier);
    const purchaseRes = await driver.purchase({
      productId: suppProd.externalId,
      quantity,
      idempotencyKey,
      customerAccounts,
    });

    if (!purchaseRes.success) {
      await prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          productTitle: product.title,
          supplierId: supplier.id,
          supplierProductId: suppProd.id,
          quantity,
          unitCostPrice,
          unitSellingPrice,
          totalAmount: totalSellingPrice,
          profitMargin: 0,
          status: 'FAILED',
          errorMessage: purchaseRes.message || 'Erreur fournisseur',
          idempotencyKey,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: `Erreur d'achat auprès du fournisseur (${supplier.name}): ${purchaseRes.message}`,
        },
        { status: 500 }
      );
    }

    const credentialsStr = typeof purchaseRes.deliveredCredentials === 'object'
      ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
      : String(purchaseRes.deliveredCredentials || 'Livré avec succès');

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { walletBalance: { decrement: totalSellingPrice } },
    });

    await prisma.supplierProduct.update({
      where: { id: suppProd.id },
      data: {
        stock: { decrement: quantity },
        sold: { increment: quantity },
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        productTitle: product.title,
        supplierId: supplier.id,
        supplierProductId: suppProd.id,
        quantity,
        unitCostPrice,
        unitSellingPrice,
        totalAmount: totalSellingPrice,
        profitMargin: totalProfitMargin,
        status: 'COMPLETED',
        deliveredCredentials: credentialsStr,
        idempotencyKey,
        supplierOrderRef: purchaseRes.orderRef,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      productTitle: product.title,
      totalAmount: totalSellingPrice,
      deliveredCredentials: credentialsStr,
      newWalletBalance: updatedUser.walletBalance,
      message: 'Commande effectuée et livrée immédiatement!',
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
