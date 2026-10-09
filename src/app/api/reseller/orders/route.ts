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
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const [orders, otpOrders] = await Promise.all([
      prisma.order.findMany({
        where: { tenantId: tenant.id },
        include: {
          user: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.otpOrder.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const completedProductOrders = orders.filter((o) => o.status === 'COMPLETED');
    const completedOtpOrders = otpOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'WAITING_SMS');

    const totalTurnover =
      completedProductOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) +
      completedOtpOrders.reduce((sum, o) => sum + (o.sellingPrice || 0), 0);

    const totalProfit =
      completedProductOrders.reduce((sum, o) => sum + (o.resellerProfit || 0), 0) +
      completedOtpOrders.reduce((sum, o) => sum + (o.resellerProfit || 0), 0);

    const unifiedList = [
      ...orders.map((o) => ({
        type: 'PRODUCT' as const,
        id: o.id,
        ticketCode: o.ticketCode,
        productTitle: o.productTitle,
        service: null,
        country: null,
        phone: null,
        smsCode: null,
        fullSms: null,
        quantity: o.quantity,
        customerEmail: o.user?.email || 'Anonyme',
        customerName: o.user?.name || 'Client',
        unitSellingPrice: o.unitSellingPrice,
        totalAmount: o.totalAmount,
        resellerProfit: o.resellerProfit,
        status: o.status,
        deliveredCredentials: o.deliveredCredentials,
        paymentInstructions: o.paymentInstructions,
        supportStatus: o.supportStatus,
        createdAt: o.createdAt,
      })),
      ...otpOrders.map((o) => ({
        type: 'OTP' as const,
        id: o.id,
        ticketCode: o.ticketCode,
        productTitle: `Numéro OTP : ${o.service.toUpperCase()} (+${o.country})`,
        service: o.service,
        country: o.country,
        phone: o.phone,
        smsCode: o.smsCode,
        fullSms: o.fullSms,
        quantity: 1,
        customerEmail: o.customerEmail || 'Anonyme',
        customerName: o.customerName || 'Client OTP',
        unitSellingPrice: o.sellingPrice,
        totalAmount: o.sellingPrice,
        resellerProfit: o.resellerProfit,
        status: o.status,
        deliveredCredentials: o.phone ? `Numéro : ${o.phone}${o.smsCode ? ` | Code SMS : ${o.smsCode}` : ''}` : null,
        paymentInstructions: o.paymentInstructions,
        supportStatus: 'OPEN',
        createdAt: o.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: unifiedList.length,
        completedOrders: completedProductOrders.length + completedOtpOrders.length,
        totalTurnover: parseFloat(totalTurnover.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        walletBalance: tenant.walletBalance,
        productOrdersCount: orders.length,
        otpOrdersCount: otpOrders.length,
      },
      orders: unifiedList,
    });
  } catch (error: any) {
    console.error('Error fetching reseller orders:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
