import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '1.2.1',
    deployedAt: '2026-10-23T11:31:00Z',
    features: {
      aiDescriptionEnhancer: true,
      modalScrollFix: true,
      modalMaxHeight720px: true,
    },
    status: 'online',
  });
}
