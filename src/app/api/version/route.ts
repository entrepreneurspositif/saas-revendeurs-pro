import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '1.2.6',
    deployedAt: new Date().toISOString(),
    commit: '2c598cd',
    features: {
      aiDescriptionEnhancer: true,
      modalScrollFix: true,
      modalMaxHeight720px: true,
      bulkProductPricing: true,
      storeOriginTracking: true,
      singleProductSalesFunnel: true,
      marketplaceFlashTemplate: true,
      agencyAiTemplate: true,
      whatsAppExpressTemplate: true,
      stickyResellerSidebarFixed: true,
      resellerRegistrationPaymentGateway: true,
    },
    status: 'online',
  });
}
