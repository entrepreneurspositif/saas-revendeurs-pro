import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { validateEmail } from '@/lib/emailValidator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity = 1, customerAccounts, userId } = body;

    // Strict numerical quantity validation
    const parsedQty = parseInt(String(quantity), 10);
    if (isNaN(parsedQty) || parsedQty < 1 || parsedQty > 100) {
      return NextResponse.json(
        { success: false, message: 'Quantité invalide. Doit être comprise entre 1 et 100.' },
        { status: 400 }
      );
    }

    // Sanitize customer inputs
    const cleanCustomerAccounts = customerAccounts ? String(customerAccounts).slice(0, 500).replace(/[<>]/g, '').trim() : null;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID du produit requis' }, { status: 400 });
    }

    let userEmail = 'client@abonnementspro.com';
    if (userId && typeof userId === 'string') {
      const cleanUserId = userId.trim();
      if (cleanUserId.includes('@')) {
        const valRes = await validateEmail(cleanUserId, false);
        if (!valRes.isValid) {
          return NextResponse.json(
            { success: false, message: valRes.error || 'Adresse e-mail client invalide ou temporaire.' },
            { status: 400 }
          );
        }
        userEmail = valRes.cleanEmail;
      } else {
        userEmail = cleanUserId;
      }
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ id: userEmail }, { email: userEmail }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail.includes('@') ? userEmail : 'client@abonnementspro.com',
          name: 'Client Abonnements Pro',
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

    if (suppProd.stock < parsedQty) {
      return NextResponse.json(
        { success: false, message: `Stock insuffisant chez le fournisseur (Disponible: ${suppProd.stock})` },
        { status: 400 }
      );
    }

    const unitSellingPrice = product.sellingPrice;
    const totalSellingPrice = unitSellingPrice * parsedQty;
    const unitCostPrice = suppProd.costPrice;
    const totalCostPrice = unitCostPrice * parsedQty;
    const totalProfitMargin = parseFloat((totalSellingPrice - totalCostPrice).toFixed(2));

    if (totalSellingPrice <= 0 || unitSellingPrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'Montant de commande invalide.' },
        { status: 400 }
      );
    }

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
      quantity: parsedQty,
      idempotencyKey,
      customerAccounts: cleanCustomerAccounts || undefined,
    });

    if (!purchaseRes.success) {
      const isOutOfStock = purchaseRes.isOutOfStock || /stock|exceeds available stock|rupture/i.test(purchaseRes.message || '');
      if (isOutOfStock && suppProd) {
        await prisma.supplierProduct.update({
          where: { id: suppProd.id },
          data: { stock: 0, isAvailable: false },
        }).catch(console.error);
      }

      await prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          productTitle: product.title,
          supplierId: supplier.id,
          supplierProductId: suppProd.id,
          quantity: parsedQty,
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
          message: isOutOfStock
            ? `Rupture de stock chez le fournisseur (${supplier.name}) : ce produit n'est actuellement plus disponible. Le stock a été actualisé à 0.`
            : `Erreur d'achat auprès du fournisseur (${supplier.name}): ${purchaseRes.message}`,
        },
        { status: isOutOfStock ? 400 : 500 }
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
        stock: { decrement: parsedQty },
        sold: { increment: parsedQty },
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        productTitle: product.title,
        supplierId: supplier.id,
        supplierProductId: suppProd.id,
        quantity: parsedQty,
        unitCostPrice,
        unitSellingPrice,
        totalAmount: totalSellingPrice,
        profitMargin: totalProfitMargin,
        status: 'COMPLETED',
        deliveredCredentials: credentialsStr,
        idempotencyKey,
        customerAccounts: cleanCustomerAccounts || undefined,
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
