import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findOrderByCodeOrId } from '@/lib/orderHelper';
import { getClientIp, checkRateLimit, recordFailure } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`lookup:${ip}`, 30, 60000);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trop de requêtes de recherche de ticket. Veuillez patienter une minute avant de réessayer.',
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim();
    const subdomain = searchParams.get('subdomain')?.trim();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const order = await findOrderByCodeOrId(code, true);

    if (!order) {
      recordFailure(`lookup:${ip}`, 10, 5 * 60 * 1000);
      return NextResponse.json(
        { success: false, message: `Aucun ticket trouvé avec le code "${code}"` },
        { status: 404 }
      );
    }

    // If subdomain is passed, we can also fetch tenant info
    let tenantInfo: any = null;
    if (order.tenantId) {
      tenantInfo = await prisma.tenant.findUnique({
        where: { id: order.tenantId },
        select: {
          storeName: true,
          contactWhatsApp: true,
          contactTelegram: true,
          contactEmail: true,
          subdomain: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        ticketCode: order.ticketCode,
        productTitle: order.productTitle,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveredCredentials: order.status === 'COMPLETED' ? order.deliveredCredentials : null,
        customerAccounts: order.customerAccounts || null,
        paymentInstructions: order.paymentInstructions,
        errorMessage: order.errorMessage,
        createdAt: order.createdAt,
        store: tenantInfo,
      },
    });
  } catch (error: any) {
    console.error('Error in tenant ticket lookup:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
