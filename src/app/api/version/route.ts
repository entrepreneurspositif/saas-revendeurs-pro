import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '1.2.2',
    deployedAt: '2026-10-23T12:05:00Z',
    features: {
      aiDescriptionEnhancer: true,
      modalScrollFix: true,
      modalMaxHeight720px: true,
      bulkProductPricing: true,
    },
    status: 'online',
  });
}
