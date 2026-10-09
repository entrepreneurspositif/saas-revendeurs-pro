import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentInstructions } from '@/lib/payment-instructions';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity = 1, customerAccounts, userId, promoCode } = body;

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

    const isExclusive = !product.activeSupplierProductId || product.badge === 'Exclusif' || product.badge === 'VIP';
    const suppProd = product.activeSupplierProduct;

    if (!isExclusive) {
      if (!suppProd || !suppProd.supplier) {
        return NextResponse.json(
          { success: false, message: 'Aucun fournisseur actif configuré pour ce produit.' },
          { status: 400 }
        );
      }

      const supplier = suppProd.supplier;
      if (!supplier.isActive) {
        return NextResponse.json(
          { success: false, message: 'Le fournisseur de ce produit est actuellement indisponible.' },
          { status: 400 }
        );
      }

      if (suppProd.stock < quantity) {
        return NextResponse.json(
          { success: false, message: `Stock insuffisant (Disponible: ${suppProd.stock})` },
          { status: 400 }
        );
      }
    }

    // Generate unique Ticket Code (e.g., TK-784920)
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `TK-${randomNum}`;

    const unitSellingPrice = product.sellingPrice;
    let totalSellingPrice = unitSellingPrice * quantity;
    const unitCostPrice = suppProd ? suppProd.costPrice : 0;
    const totalCostPrice = unitCostPrice * quantity;

    // Apply Promo Code discount if provided & valid
    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const cleanPromo = promoCode.trim().toUpperCase();
      const promo = await prisma.promoCode.findUnique({ where: { code: cleanPromo } });
      if (
        promo &&
        promo.isActive &&
        (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) &&
        (promo.maxUses === null || promo.usedCount < promo.maxUses)
      ) {
        if (promo.minPurchaseAmount <= 0 || totalSellingPrice >= promo.minPurchaseAmount) {
          let discount = 0;
          if (promo.discountType === 'PERCENTAGE') {
            discount = (totalSellingPrice * promo.discountValue) / 100;
          } else {
            discount = Math.min(promo.discountValue, totalSellingPrice);
          }
          totalSellingPrice = Math.max(0, totalSellingPrice - discount);

          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const totalProfitMargin = parseFloat((totalSellingPrice - totalCostPrice).toFixed(2));

    // Fetch Shared Admin Payment Instructions
    const paymentInstructions = await getPaymentInstructions();

    const idempotencyKey = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create Order with PENDING_PAYMENT status
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        productTitle: product.title,
        supplierId: suppProd?.supplier?.id || null,
        supplierProductId: suppProd?.id || null,
        ticketCode: ticketCode,
        quantity,
        unitCostPrice,
        unitSellingPrice,
        totalAmount: totalSellingPrice,
        profitMargin: totalProfitMargin,
        status: 'PENDING_PAYMENT',
        paymentInstructions,
        idempotencyKey,
      },
    });

    // Send background Telegram Notification to Admin
    sendTelegramNotification({
      title: product.title,
      ticketCode: order.ticketCode,
      type: 'ORDER',
      amount: `$${totalSellingPrice.toFixed(2)} USD`,
      details: `Quantité : ${quantity}\nClient : ${user.email}`,
    }).catch((err) => console.error('Telegram notification error:', err));

    return NextResponse.json({
      success: true,
      ticketCode: order.ticketCode,
      productTitle: product.title,
      totalAmount: totalSellingPrice,
      quantity,
      paymentInstructions,
      message: 'Ticket de commande généré avec succès!',
    });
  } catch (error: any) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
