import { prisma } from '@/lib/prisma';

export interface FeexPayConfig {
  apiKey: string;
  shopId: string;
  enabled: boolean;
}

export async function getFeexPayConfig(): Promise<FeexPayConfig> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['feexpay_api_key', 'feexpay_shop_id', 'feexpay_enabled'],
      },
    },
  });

  const map = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value?.trim();
    return acc;
  }, {} as Record<string, string>);

  return {
    apiKey: map['feexpay_api_key'] || 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW',
    shopId: map['feexpay_shop_id'] || '673db7093c2872d9f60742de',
    enabled: map['feexpay_enabled'] !== 'false',
  };
}

export function convertUsdToXof(amountUsd: number): number {
  // Standard conversion 1 USD = 650 XOF / FCFA
  const rate = 650;
  const rawXof = Math.round(Number(amountUsd || 0) * rate);
  // FeexPay V2 requires a strict integer of at least 50 XOF
  return Math.max(50, Math.round(rawXof));
}
