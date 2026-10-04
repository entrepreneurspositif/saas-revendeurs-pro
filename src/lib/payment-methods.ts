import { prisma } from '@/lib/prisma';
import { getPaymentInstructions } from '@/lib/payment-instructions';
import { getFeexPayConfig } from '@/lib/feexpay';
import { getMonerooConfig } from '@/lib/moneroo';

export interface PaymentGatewayConfig {
  manual: {
    enabled: boolean;
    instructions: string;
  };
  feexpay: {
    enabled: boolean;
    apiKey: string;
    shopId: string;
  };
  moneroo: {
    enabled: boolean;
    secretKey: string;
  };
  custom: {
    enabled: boolean;
    name: string;
    apiKey: string;
    siteId: string;
    checkoutUrl: string;
    instructions: string;
  };
}

export async function getAllPaymentMethods(): Promise<PaymentGatewayConfig> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'manual_payment_enabled',
          'feexpay_enabled',
          'feexpay_api_key',
          'feexpay_shop_id',
          'moneroo_enabled',
          'moneroo_secret_key',
          'custom_gateway_enabled',
          'custom_gateway_name',
          'custom_gateway_api_key',
          'custom_gateway_site_id',
          'custom_gateway_checkout_url',
          'custom_gateway_instructions',
        ],
      },
    },
  });

  const map = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value?.trim();
    return acc;
  }, {} as Record<string, string>);

  const manualInstructions = await getPaymentInstructions();
  const feexpayConfig = await getFeexPayConfig();
  const monerooConfig = await getMonerooConfig();

  return {
    manual: {
      enabled: map['manual_payment_enabled'] !== 'false',
      instructions: manualInstructions,
    },
    feexpay: {
      enabled: feexpayConfig.enabled,
      apiKey: feexpayConfig.apiKey,
      shopId: feexpayConfig.shopId,
    },
    moneroo: {
      enabled: monerooConfig.enabled,
      secretKey: monerooConfig.secretKey,
    },
    custom: {
      enabled: map['custom_gateway_enabled'] === 'true',
      name: map['custom_gateway_name'] || 'CinetPay / Autre Passerelle',
      apiKey: map['custom_gateway_api_key'] || '',
      siteId: map['custom_gateway_site_id'] || '',
      checkoutUrl: map['custom_gateway_checkout_url'] || '',
      instructions: map['custom_gateway_instructions'] || 'Paiement sécurisé via passerelle partenaire',
    },
  };
}
