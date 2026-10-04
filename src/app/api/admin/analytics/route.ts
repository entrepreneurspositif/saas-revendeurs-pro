import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const selectedPath = searchParams.get('path') || 'ALL';
    const selectedDevice = searchParams.get('device') || 'ALL';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined = now;

    // Timeframe filtering
    if (timeframe === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (timeframe === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'custom' && startDateParam) {
      startDate = new Date(startDateParam);
      if (endDateParam) {
        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (timeframe === 'all') {
      startDate = undefined;
    }

    // Build Prisma `where` query clause
    const whereClause: any = {};

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate,
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    if (selectedPath !== 'ALL') {
      whereClause.path = selectedPath;
    }

    if (selectedDevice !== 'ALL') {
      whereClause.device = selectedDevice;
    }

    // 1. Fetch total matching logs
    const logs = await prisma.visitLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });

    const totalVisits = logs.length;

    // 2. Calculate Unique Visitors (distinct ipHash)
    const uniqueVisitorSet = new Set(logs.map((l) => l.ipHash).filter(Boolean));
    const uniqueVisitors = uniqueVisitorSet.size;

    // 3. Count Today's Visits (from midnight today)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayVisitsCount = logs.filter((l) => new Date(l.createdAt) >= startOfToday).length;

    // 4. Breakdown by Device
    const deviceBreakdown = {
      mobile: logs.filter((l) => l.device === 'mobile').length,
      desktop: logs.filter((l) => l.device === 'desktop').length,
      tablet: logs.filter((l) => l.device === 'tablet').length,
    };

    // 5. Breakdown by Top Pages
    const pageMap: Record<string, number> = {};
    logs.forEach((l) => {
      pageMap[l.path] = (pageMap[l.path] || 0) + 1;
    });

    const topPages = Object.entries(pageMap)
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 6. Breakdown by Referrer
    const referrerMap: Record<string, number> = {};
    logs.forEach((l) => {
      const ref = l.referrer || 'Direct / Recherche';
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });

    const topReferrers = Object.entries(referrerMap)
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 7. Time series grouping by Date (or Hour if timeframe is '24h' or 'today')
    const timeSeriesMap: Record<string, { visits: number; uniques: Set<string> }> = {};
    const isHourly = timeframe === 'today' || timeframe === '24h';

    logs.forEach((l) => {
      const d = new Date(l.createdAt);
      let key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      if (isHourly) {
        const hour = String(d.getHours()).padStart(2, '0');
        key = `${key} ${hour}:00`;
      }

      if (!timeSeriesMap[key]) {
        timeSeriesMap[key] = { visits: 0, uniques: new Set() };
      }
      timeSeriesMap[key].visits += 1;
      if (l.ipHash) {
        timeSeriesMap[key].uniques.add(l.ipHash);
      }
    });

    const timeSeries = Object.entries(timeSeriesMap)
      .map(([date, data]) => ({
        date,
        visits: data.visits,
        uniques: data.uniques.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 8. Recent 50 Visit Logs
    const recentLogs = logs.slice(0, 50).map((l) => ({
      id: l.id,
      path: l.path,
      device: l.device,
      referrer: l.referrer,
      ipHash: l.ipHash,
      createdAt: l.createdAt,
    }));

    return NextResponse.json({
      success: true,
      filters: {
        timeframe,
        path: selectedPath,
        device: selectedDevice,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
      summary: {
        totalVisits,
        uniqueVisitors,
        todayVisits: todayVisitsCount,
        deviceBreakdown,
      },
      timeSeries,
      topPages,
      topReferrers,
      recentLogs,
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
