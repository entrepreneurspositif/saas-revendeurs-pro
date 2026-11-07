import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { calculateSaasPrices } from '@/lib/saasPricingHelper';
import { sendTelegramNotification, sendResellerTelegramNotification } from '@/lib/telegram';
import { validateEmail } from '@/lib/emailValidator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, subdomain, productId, quantity = 1, customerAccounts, customerEmail, customerName } = body;

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
    const cleanCustomerEmail = customerEmail ? String(customerEmail).slice(0, 150).trim() : null;
    const cleanCustomerName = customerName ? String(customerName).slice(0, 100).replace(/[<>]/g, '').trim() : null;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID du produit requis' }, { status: 400 });
    }

    if (!tenantId && !subdomain) {
      return NextResponse.json({ success: false, message: 'Identifiant de boutique requis' }, { status: 400 });
    }

    const cleanSub = subdomain?.toLowerCase().trim();
    const cleanSubWithoutWww = cleanSub?.replace(/^www\./, '');

    // Resolve tenant
    const tenant = await prisma.tenant.findFirst({
      where: tenantId
        ? { id: tenantId }
        : {
            OR: [
              { subdomain: cleanSub },
              { customDomain: cleanSub },
              ...(cleanSubWithoutWww ? [{ customDomain: cleanSubWithoutWww }] : []),
            ],
          },
      include: { plan: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Cette boutique est introuvable ou inactive' },
        { status: 404 }
      );
    }

    // STRICT SECURITY: Reseller must verify email before their store can take orders
    if (!tenant.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cette boutique est en attente de vérification par son propriétaire. La prise de commandes y est temporairement suspendue.',
          code: 'STORE_UNVERIFIED',
        },
        { status: 403 }
      );
    }

    // Validate customer email if provided (block disposable/temporary and invalid emails)
    let emailToUse = 'client-anonyme@abonnementspro.com';
    if (cleanCustomerEmail) {
      const emailVal = await validateEmail(cleanCustomerEmail, false);
      if (!emailVal.isValid) {
        return NextResponse.json(
          {
            success: false,
            message: emailVal.error || 'Adresse e-mail client invalide ou temporaire.',
          },
          { status: 400 }
        );
      }
      emailToUse = emailVal.cleanEmail;
    }

    // Resolve customer user
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

    if (suppProd.stock < parsedQty) {
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
    const totalSellingPrice = parseFloat((unitSellingPrice * parsedQty).toFixed(2));
    const unitCostPrice = calc.supplierCost;
    const totalCostPrice = parseFloat((unitCostPrice * parsedQty).toFixed(2));
    const totalResellerProfit = parseFloat((calc.resellerProfit * parsedQty).toFixed(2));
    const totalPlatformProfit = parseFloat((calc.platformProfit * parsedQty).toFixed(2));
    const totalProfitMargin = parseFloat((totalSellingPrice - totalCostPrice).toFixed(2));

    if (totalSellingPrice <= 0 || unitSellingPrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'Montant de commande invalide.' },
        { status: 400 }
      );
    }

    const idempotencyKey = `ord-tenant-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Execute supplier order
    const driver = createSupplierDriver(suppProd.supplier);
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
          supplierId: suppProd.supplier.id,
          supplierProductId: suppProd.id,
          quantity: parsedQty,
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
          message: isOutOfStock
            ? `Rupture de stock chez le fournisseur : ce produit est actuellement indisponible chez le grossiste. Le stock a été actualisé à 0.`
            : `Erreur d'approvisionnement fournisseur: ${purchaseRes.message}`,
        },
        { status: isOutOfStock ? 400 : 500 }
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
        stock: { decrement: parsedQty },
        sold: { increment: parsedQty },
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
        quantity: parsedQty,
        unitCostPrice,
        unitSellingPrice,
        totalAmount: totalSellingPrice,
        profitMargin: totalProfitMargin,
        tenantId: tenant.id,
        resellerProfit: totalResellerProfit,
        platformProfit: totalPlatformProfit,
        status: 'COMPLETED',
        deliveredCredentials: credentialsStr,
        customerAccounts: cleanCustomerAccounts || undefined,
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
      title: product.title,
      ticketCode: order.ticketCode,
      type: 'ORDER',
      amount: `$${totalSellingPrice.toFixed(2)} USD`,
      storeName: tenant.storeName || tenant.name,
      storeSubdomain: tenant.subdomain,
      tenantId: tenant.id,
      platformProfit: totalPlatformProfit,
      resellerProfit: totalResellerProfit,
      details: `Vente instantanée livrée automatiquement !\nClient : ${user.email}`,
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
