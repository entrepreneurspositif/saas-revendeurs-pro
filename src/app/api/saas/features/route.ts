import { NextResponse } from 'next/server';
import { SAAS_AVAILABLE_FEATURES } from '@/lib/saasPricingHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    features: SAAS_AVAILABLE_FEATURES,
  });
}
