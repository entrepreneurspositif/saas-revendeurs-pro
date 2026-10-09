import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { calculateSaasPrices } from '@/lib/saasPricingHelper';
import { sendTelegramNotification, sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, subdomain, productId, quantity = 1, customerAccounts, customerEmail, customerName } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID du produit requis' }, { status: 400 });
    }

    if (!tenantId && !subdomain) {
      return NextResponse.json({ success: false, message: 'Identifiant de boutique requis' }, { status: 400 });
    }

    // Resolve tenant
    const tenant = await prisma.tenant.findFirst({
      where: tenantId ? { id: tenantId } : { subdomain: subdomain?.toLowerCase().trim() },
      include: { plan: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Cette boutique est introuvable ou inactive' },
        { status: 404 }
      );
    }

    // Resolve customer user
    const emailToUse = customerEmail?.trim() || 'client@example.com';
    let user = await prisma.user.findFirst({
      where: { email: emailToUse },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: emailToUse,
          name: customerName?.trim() || 'Client Revendeur',
          role: 'CUSTOMER',
          walletBalance: 999.0,
        },
      });
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        activeSupplierProduct: {
          include: { supplier: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ce produit est actuellement indisponible.' },
        { status: 400 }
      );
    }

    // Check custom price
    const customConfig = await prisma.tenantProductPrice.findUnique({
      where: {
        tenantId_productId: {
          tenantId: tenant.id,
          productId: product.id,
        },
      },
    });

    if (customConfig && customConfig.isEnabled === false) {
      return NextResponse.json(
        { success: false, message: 'Ce produit n\'est pas disponible dans cette boutique.' },
        { status: 400 }
      );
    }

    const suppProd = product.activeSupplierProduct;
    if (!suppProd || !suppProd.supplier || !suppProd.supplier.isActive) {
      return NextResponse.json(
        { success: false, message: 'Le fournisseur pour ce produit est actuellement indisponible.' },
        { status: 400 }
      );
    }

    if (suppProd.stock < quantity) {
      return NextResponse.json(
        { success: false, message: `Stock insuffisant (Disponible: ${suppProd.stock})` },
        { status: 400 }
      );
    }

    // Calculate exact pricing based on SaaS plan discount
    const planDiscount = tenant.plan?.marginDiscountPercent || 0;
    const calc = calculateSaasPrices({
      supplierCost: suppProd.costPrice,
      baseSellingPrice: product.sellingPrice,
      discountPercent: planDiscount,
      customSellingPrice: customConfig?.customSellingPrice,
    });

    const unitSellingPrice = calc.resellerSellingPrice;
    const totalSellingPrice = parseFloat((unitSellingPrice * quantity).toFixed(2));
    const unitCostPrice = calc.supplierCost;
    const totalCostPrice = parseFloat((unitCostPrice * quantity).toFixed(2));
    const totalResellerProfit = parseFloat((calc.resellerProfit * quantity).toFixed(2));
    const totalPlatformProfit = parseFloat((calc.platformProfit * quantity).toFixed(2));
    const totalProfitMargin = parseFloat((totalSellingPrice - totalCostPrice).toFixed(2));

    const idempotencyKey = `ord-tenant-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Execute supplier order
    const driver = createSupplierDriver(suppProd.supplier);
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
          supplierId: suppProd.supplier.id,
          supplierProductId: suppProd.id,
          quantity,
          unitCostPrice,
          unitSellingPrice,
          totalAmount: totalSellingPrice,
          profitMargin: 0,
          tenantId: tenant.id,
          resellerProfit: 0,
          platformProfit: 0,
          status: 'FAILED',
          errorMessage: purchaseRes.message || 'Erreur fournisseur',
          idempotencyKey,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: `Erreur d'approvisionnement fournisseur: ${purchaseRes.message}`,
        },
        { status: 500 }
      );
    }

    const credentialsStr =
      typeof purchaseRes.deliveredCredentials === 'object'
        ? JSON.stringify(purchaseRes.deliveredCredentials, null, 2)
        : String(purchaseRes.deliveredCredentials || 'Livré avec succès');

    // Update supplier stock
    await prisma.supplierProduct.update({
      where: { id: suppProd.id },
      data: {
        stock: { decrement: quantity },
        sold: { increment: quantity },
      },
    });

    // Credit reseller wallet balance with their net profit
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        walletBalance: { increment: totalResellerProfit },
        totalEarnings: { increment: totalResellerProfit },
      },
    });

    // Create completed order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        productTitle: product.title,
        supplierId: suppProd.supplier.id,
        supplierProductId: suppProd.id,
        quantity,
        unitCostPrice,
        unitSellingPrice,
        totalAmount: totalSellingPrice,
        profitMargin: totalProfitMargin,
        tenantId: tenant.id,
        resellerProfit: totalResellerProfit,
        platformProfit: totalPlatformProfit,
        status: 'COMPLETED',
        deliveredCredentials: credentialsStr,
        idempotencyKey,
        supplierOrderRef: purchaseRes.orderRef,
      },
    });

    // Notify reseller on Telegram
    sendResellerTelegramNotification({
      tenantId: tenant.id,
      eventType: 'NEW_ORDER',
      title: `Nouvelle Vente : ${product.title}`,
      ticketCode: order.ticketCode,
      amount: `$${totalSellingPrice.toFixed(2)} USD`,
      resellerProfit: `+$${totalResellerProfit.toFixed(2)} USD`,
      details: `Vente réussie sur votre vitrine !\nVotre commission nette (+${totalResellerProfit.toFixed(2)} USD) a été créditée sur votre portefeuille.`,
    }).catch(console.error);

    // Notify Super Admin on Telegram
    sendTelegramNotification({
      title: `Vente Boutique Revendeur — ${product.title}`,
      ticketCode: order.ticketCode,
      type: 'ORDER',
      amount: `$${totalSellingPrice.toFixed(2)} USD`,
      details: `Boutique : ${tenant.storeName || tenant.name} (/store/${tenant.subdomain})\nBénéfice Plateforme : +$${totalPlatformProfit.toFixed(2)} USD\nCommission Revendeur : +$${totalResellerProfit.toFixed(2)} USD`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      ticketCode: order.ticketCode,
      productTitle: product.title,
      totalAmount: totalSellingPrice,
      deliveredCredentials: credentialsStr,
      message: 'Commande validée et livrée immédiatement!',
    });
  } catch (error: any) {
    console.error('Tenant purchase error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
