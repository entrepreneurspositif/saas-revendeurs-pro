import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      select: { id: true, subdomain: true, storeName: true, createdAt: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    // 1. Fetch visits for this tenant
    const visits = await prisma.visitLog.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const totalVisits = visits.length;
    const uniqueIps = new Set(visits.map((v) => v.ipHash).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;

    // 2. Fetch orders and OTP tickets for this tenant
    const [orders, otpOrders] = await Promise.all([
      prisma.order.findMany({
        where: { tenantId: tenant.id },
        select: {
          id: true,
          totalAmount: true,
          unitSellingPrice: true,
          unitCostPrice: true,
          resellerProfit: true,
          platformProfit: true,
          status: true,
          createdAt: true,
          product: { select: { title: true } },
        },
      }),
      prisma.otpOrder.findMany({
        where: { tenantId: tenant.id },
        select: {
          id: true,
          sellingPrice: true,
          costPrice: true,
          resellerProfit: true,
          status: true,
          service: true,
          createdAt: true,
        },
      }),
    ]);

    const totalOrdersCount = orders.length + otpOrders.length;
    const completedOrdersCount =
      orders.filter((o) => o.status === 'COMPLETED').length +
      otpOrders.filter((o) => o.status === 'COMPLETED').length;

    // Financials
    let totalTurnover = 0;
    let totalProfit = 0;

    for (const o of orders) {
      totalTurnover += o.totalAmount || o.unitSellingPrice || 0;
      totalProfit += o.resellerProfit || 0;
    }

    for (const o of otpOrders) {
      totalTurnover += o.sellingPrice || 0;
      totalProfit += o.resellerProfit || 0;
    }

    // Conversion rate
    const conversionRate = uniqueVisitors > 0 ? ((totalOrdersCount / uniqueVisitors) * 100).toFixed(1) : '0.0';

    // 3. Daily breakdown (last 14 days)
    const daysMap: Record<string, { date: string; label: string; visits: number; uniqueIps: Set<string>; orders: number }> = {};
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      daysMap[iso] = {
        date: iso,
        label: dayName,
        visits: 0,
        uniqueIps: new Set(),
        orders: 0,
      };
    }

    for (const v of visits) {
      const dateStr = new Date(v.createdAt).toISOString().split('T')[0];
      if (daysMap[dateStr]) {
        daysMap[dateStr].visits += 1;
        if (v.ipHash) daysMap[dateStr].uniqueIps.add(v.ipHash);
      }
    }

    for (const o of orders) {
      const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
      if (daysMap[dateStr]) daysMap[dateStr].orders += 1;
    }

    for (const o of otpOrders) {
      const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
      if (daysMap[dateStr]) daysMap[dateStr].orders += 1;
    }

    const timeline = Object.values(daysMap).map((item) => ({
      date: item.date,
      label: item.label,
      visits: item.visits,
      uniqueVisitors: item.uniqueIps.size,
      orders: item.orders,
    }));

    // 4. Device breakdown
    const devices: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    for (const v of visits) {
      const d = (v.device || 'desktop').toLowerCase();
      if (devices[d] !== undefined) devices[d] += 1;
      else devices.desktop += 1;
    }

    // 5. Referrer breakdown
    const referrersMap: Record<string, number> = {};
    for (const v of visits) {
      const ref = v.referrer || 'Direct / Recherche';
      referrersMap[ref] = (referrersMap[ref] || 0) + 1;
    }
    const topReferrers = Object.entries(referrersMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // 6. Top ordered items
    const productStats: Record<string, { ordersCount: number; totalRevenue: number }> = {};
    for (const o of orders) {
      const title = o.product?.title || 'Licence';
      if (!productStats[title]) productStats[title] = { ordersCount: 0, totalRevenue: 0 };
      productStats[title].ordersCount += 1;
      productStats[title].totalRevenue += o.totalAmount || o.unitSellingPrice || 0;
    }
    for (const o of otpOrders) {
      const title = `OTP: ${o.service}`;
      if (!productStats[title]) productStats[title] = { ordersCount: 0, totalRevenue: 0 };
      productStats[title].ordersCount += 1;
      productStats[title].totalRevenue += o.sellingPrice || 0;
    }
    const topProducts = Object.entries(productStats)
      .sort((a, b) => b[1].ordersCount - a[1].ordersCount)
      .slice(0, 6)
      .map(([name, stat]) => ({
        name,
        ordersCount: stat.ordersCount,
        totalRevenue: parseFloat(stat.totalRevenue.toFixed(2)),
      }));

    return NextResponse.json({
      success: true,
      analytics: {
        totalVisits,
        uniqueVisitors,
        totalOrdersCount,
        completedOrdersCount,
        conversionRate,
        totalTurnover,
        totalProfit,
        timeline,
        devices,
        topReferrers,
        topProducts,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reseller analytics:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
