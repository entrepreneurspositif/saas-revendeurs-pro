import { NextResponse } from 'next/server';
import { getAllPaymentMethods } from '@/lib/payment-methods';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const methods = await getAllPaymentMethods();
    return NextResponse.json({ success: true, methods });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
