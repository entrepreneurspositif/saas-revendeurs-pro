import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        plan: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            profitMargin: true,
            resellerProfit: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTenants = tenants.map((t) => {
      const completedOrders = t.orders.filter((o) => o.status === 'COMPLETED');
      const totalTurnover = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalResellerProfit = completedOrders.reduce((sum, o) => sum + (o.resellerProfit || 0), 0);

      return {
        id: t.id,
        email: t.email,
        name: t.name,
        subdomain: t.subdomain,
        customDomain: t.customDomain,
        storeName: t.storeName,
        planId: t.planId,
        planName: t.plan?.name || t.planId,
        planDiscount: t.plan?.marginDiscountPercent || 0,
        planStatus: t.planStatus,
        planExpiresAt: t.planExpiresAt,
        walletBalance: t.walletBalance,
        totalEarnings: t.totalEarnings || totalResellerProfit,
        totalTurnover: parseFloat(totalTurnover.toFixed(2)),
        ordersCount: t.orders.length,
        completedOrdersCount: completedOrders.length,
        isActive: t.isActive,
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      resellers: formattedTenants,
    });
  } catch (error: any) {
    console.error('Error fetching resellers:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, planId, planStatus, isActive, walletBalanceAdjustment } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID revendeur requis' }, { status: 400 });
    }

    const updateData: any = {};

    if (planId) {
      const planExists = await prisma.saasPlan.findUnique({ where: { id: planId } });
      if (!planExists) {
        return NextResponse.json({ success: false, message: 'Plan inexistant' }, { status: 400 });
      }
      updateData.planId = planId;
    }

    if (planStatus !== undefined) {
      updateData.planStatus = planStatus;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (walletBalanceAdjustment !== undefined && !isNaN(Number(walletBalanceAdjustment))) {
      const amount = Number(walletBalanceAdjustment);
      updateData.walletBalance = { increment: amount };
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: { plan: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Revendeur mis à jour avec succès',
      reseller: updated,
    });
  } catch (error: any) {
    console.error('Error updating reseller:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
