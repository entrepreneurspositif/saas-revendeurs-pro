import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const tenantId = searchParams.get('tenantId');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { subject: { contains: q } },
        { ticketCode: { contains: q } },
        {
          tenant: {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { storeName: { contains: q } },
              { subdomain: { contains: q } },
            ],
          },
        },
      ];
    }

    const tickets = await prisma.resellerTicket.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            storeName: true,
            subdomain: true,
            planId: true,
            planStatus: true,
            walletBalance: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Compute overall stats
    const allTickets = await prisma.resellerTicket.findMany({
      select: { status: true },
    });

    const stats = {
      total: allTickets.length,
      open: allTickets.filter((t) => t.status === 'OPEN').length,
      inProgress: allTickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: allTickets.filter((t) => t.status === 'RESOLVED').length,
      closed: allTickets.filter((t) => t.status === 'CLOSED').length,
    };

    return NextResponse.json({
      success: true,
      tickets,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching admin reseller tickets:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
