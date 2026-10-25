import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '1.2.7',
    deployedAt: new Date().toISOString(),
    commit: 'custom-domain-ready',
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
      proCustomDomainSupport: true,
    },
    status: 'online',
  });
}
