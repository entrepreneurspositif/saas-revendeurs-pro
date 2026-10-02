import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentInstructions } from '@/lib/payment-instructions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const instructions = await getPaymentInstructions();
    return NextResponse.json({ success: true, instructions });
  } catch (error: any) {
    const instructions = await getPaymentInstructions();
    return NextResponse.json({ success: false, instructions, message: error.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { instructions } = await req.json();

    if (!instructions) {
      return NextResponse.json({ success: false, message: 'Les instructions de paiement ne peuvent pas être vides' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'payment_instructions' },
      update: { value: instructions },
      create: { key: 'payment_instructions', value: instructions },
    });

    await prisma.setting.upsert({
      where: { key: 'PAYMENT_INSTRUCTIONS' },
      update: { value: instructions },
      create: { key: 'PAYMENT_INSTRUCTIONS', value: instructions },
    });

    return NextResponse.json({ success: true, instructions, message: 'Instructions de paiement enregistrées pour tous les services (Abonnements, Produits & OTP)' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
