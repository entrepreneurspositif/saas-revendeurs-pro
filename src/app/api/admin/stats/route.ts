import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { isActive: true } });
    const totalSuppliers = await prisma.supplier.count();
    const activeSuppliers = await prisma.supplier.count({ where: { isActive: true } });

    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
    });

    const otpCompletedOrders = await prisma.otpOrder.findMany({
      where: { status: 'COMPLETED' },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    let officialOrdersCount = 0;
    let resellerOrdersCount = 0;
    let resellerTotalProfit = 0;
    let platformProfitFromResellers = 0;

    orders.forEach((o) => {
      totalRevenue += o.totalAmount;
      totalCost += o.unitCostPrice * o.quantity;
      totalProfit += o.profitMargin;
      if (o.tenantId) {
        resellerOrdersCount++;
        resellerTotalProfit += o.resellerProfit || 0;
        platformProfitFromResellers += o.platformProfit || 0;
      } else {
        officialOrdersCount++;
      }
    });

    otpCompletedOrders.forEach((o) => {
      totalRevenue += o.sellingPrice;
      totalCost += o.costPrice;
      totalProfit += (o.sellingPrice - o.costPrice);
      if (o.tenantId) {
        resellerOrdersCount++;
        resellerTotalProfit += o.resellerProfit || 0;
        platformProfitFromResellers += o.platformProfit || 0;
      } else {
        officialOrdersCount++;
      }
    });

    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        product: true,
        supplier: true,
        tenant: {
          select: {
            id: true,
            name: true,
            storeName: true,
            subdomain: true,
            customDomain: true,
            planId: true,
          },
        },
      },
    });

    const recentOtpOrders = await prisma.otpOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            storeName: true,
            subdomain: true,
            customDomain: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitMarginPercent: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0,
        totalOrdersCount: orders.length + otpCompletedOrders.length,
        officialOrdersCount,
        resellerOrdersCount,
        resellerTotalProfit: parseFloat(resellerTotalProfit.toFixed(2)),
        platformProfitFromResellers: parseFloat(platformProfitFromResellers.toFixed(2)),
        totalProducts,
        activeProducts,
        totalSuppliers,
        activeSuppliers,
      },
      recentOrders,
      recentOtpOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
