import { NextResponse } from 'next/server';
import { findOrderByCodeOrId } from '@/lib/orderHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code de ticket requis' },
        { status: 400 }
      );
    }

    const order = await findOrderByCodeOrId(code);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Code de ticket introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        ticketCode: order.ticketCode,
        productTitle: order.productTitle,
        quantity: order.quantity,
        status: order.status,
        supportStatus: order.supportStatus || 'OPEN',
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error verifying ticket for support:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification du ticket' },
      { status: 500 }
    );
  }
}
