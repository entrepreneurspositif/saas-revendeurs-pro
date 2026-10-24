import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '1.2.3',
    deployedAt: new Date().toISOString(),
    features: {
      aiDescriptionEnhancer: true,
      modalScrollFix: true,
      modalMaxHeight720px: true,
      bulkProductPricing: true,
      storeOriginTracking: true,
    },
    status: 'online',
  });
}
