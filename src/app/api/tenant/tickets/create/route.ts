import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSaasPrices } from '@/lib/saasPricingHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subdomain, tenantId, productId, quantity = 1, customerAccounts, customerEmail, customerName } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'ID du produit requis' }, { status: 400 });
    }

    if (!subdomain && !tenantId) {
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

    // Find customer user or create
    const emailToUse = customerEmail?.trim() || 'client@example.com';
    let user = await prisma.user.findFirst({
      where: { email: emailToUse },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: emailToUse,
          name: customerName?.trim() || 'Client Boutique',
          role: 'CUSTOMER',
          walletBalance: 0.0,
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

    // Check custom price & visibility
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
        { success: false, message: 'Le fournisseur pour ce produit est temporairement indisponible.' },
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

    // Generate unique Ticket Code (e.g., TK-582914)
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `TK-${randomNum}`;

    // Custom or default payment instructions for this reseller
    let paymentInstructions = tenant.paymentInstructions;
    if (!paymentInstructions || !paymentInstructions.trim()) {
      paymentInstructions = `=== INSTRUCTIONS DE RÈGLEMENT (${tenant.storeName}) ===
1. Effectuez votre paiement d'un montant de $${totalSellingPrice.toFixed(2)} USD (ou équivalent FCFA).
2. Pour confirmer votre commande, contactez immédiatement le responsable de la boutique :
   - WhatsApp : ${tenant.contactWhatsApp || 'Non configuré'}
   - Telegram : ${tenant.contactTelegram || 'Non configuré'}
   - Email : ${tenant.contactEmail || tenant.email}
3. Transmettez impérativement votre CODE TICKET : ${ticketCode}
4. Dès réception de votre règlement, votre ticket sera validé et vos accès/identifiants seront livrés instantanément.`;
    }

    const idempotencyKey = `ord-tenant-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create Order with PENDING_PAYMENT status
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        productTitle: product.title,
        supplierId: suppProd.supplier.id,
        supplierProductId: suppProd.id,
        ticketCode: ticketCode,
        quantity,
        unitCostPrice,
        unitSellingPrice,
        totalAmount: totalSellingPrice,
        profitMargin: totalProfitMargin,
        tenantId: tenant.id,
        resellerProfit: totalResellerProfit,
        platformProfit: totalPlatformProfit,
        status: 'PENDING_PAYMENT',
        paymentInstructions,
        idempotencyKey,
      },
    });

    return NextResponse.json({
      success: true,
      ticketCode: order.ticketCode,
      productTitle: product.title,
      totalAmount: totalSellingPrice,
      quantity,
      paymentInstructions,
      status: 'PENDING_PAYMENT',
      resellerWhatsApp: tenant.contactWhatsApp,
      resellerStoreName: tenant.storeName,
      message: 'Ticket de commande généré avec succès !',
    });
  } catch (error: any) {
    console.error('Error creating tenant ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
