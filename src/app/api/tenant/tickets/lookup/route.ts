import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findOrderByCodeOrId } from '@/lib/orderHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim();
    const subdomain = searchParams.get('subdomain')?.trim();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Code de ticket requis' }, { status: 400 });
    }

    const order = await findOrderByCodeOrId(code, true);

    if (!order) {
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
