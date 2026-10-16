import { prisma } from '@/lib/prisma';

export interface FeexPayConfig {
  apiKey: string;
  shopId: string;
  enabled: boolean;
  autoPayoutEnabled: boolean;
  autoPayoutMaxUsd: number;
  autoPayoutCooldownMinutes: number;
}

export async function getFeexPayConfig(): Promise<FeexPayConfig> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'feexpay_api_key',
          'feexpay_shop_id',
          'feexpay_enabled',
          'feexpay_auto_payout_enabled',
          'feexpay_auto_payout_max_usd',
          'feexpay_auto_payout_cooldown_minutes',
        ],
      },
    },
  });

  const map = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value?.trim();
    return acc;
  }, {} as Record<string, string>);

  const DEFAULT_FEEXPAY_API_KEY = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const DEFAULT_FEEXPAY_SHOP_ID = '673db7093c2872d9f60742de';

  const envKey = process.env.FEEXPAY_PAYOUT_API_KEY || process.env.FEEXPAY_API_KEY;
  const dbKey = map['feexpay_api_key'];
  const resolvedKey =
    (envKey && envKey.trim().startsWith('fp_') ? envKey.trim() : '') ||
    (dbKey && dbKey.trim().startsWith('fp_') ? dbKey.trim() : '') ||
    DEFAULT_FEEXPAY_API_KEY;

  const envShop = process.env.FEEXPAY_SHOP_ID;
  const dbShop = map['feexpay_shop_id'];
  const resolvedShop =
    (envShop && envShop.trim().length >= 10 ? envShop.trim() : '') ||
    (dbShop && dbShop.trim().length >= 10 ? dbShop.trim() : '') ||
    DEFAULT_FEEXPAY_SHOP_ID;

  return {
    apiKey: resolvedKey,
    shopId: resolvedShop,
    enabled: map['feexpay_enabled'] !== 'false',
    autoPayoutEnabled: map['feexpay_auto_payout_enabled'] !== 'false', // Default true (Method B)
    autoPayoutMaxUsd: parseFloat(map['feexpay_auto_payout_max_usd'] || '25'),
    autoPayoutCooldownMinutes: parseInt(map['feexpay_auto_payout_cooldown_minutes'] || '60', 10),
  };
}

export function convertUsdToXof(amountUsd: number): number {
  // Standard conversion 1 USD = 650 XOF / FCFA
  const rate = 650;
  const rawXof = Math.round(Number(amountUsd || 0) * rate);
  // FeexPay requires a strict integer of at least 50 XOF
  return Math.max(50, Math.round(rawXof));
}

export function isFeexPaySupportedMethod(paymentMethod: string): boolean {
  const m = (paymentMethod || '').toUpperCase();
  if (m.includes('USDT') || m.includes('CRYPTO') || m.includes('VIREMENT')) {
    return false;
  }
  return (
    m.includes('MTN') ||
    m.includes('MOOV') ||
    m.includes('CELTIIS') ||
    m.includes('ORANGE') ||
    m.includes('WAVE') ||
    m.includes('TOGO') ||
    m.includes('TMONEY') ||
    m.includes('FREE')
  );
}

/**
 * Extracts and normalizes a phone number into international digits only (e.g. 2290197000000)
 */
export function normalizePayoutPhoneNumber(rawDetails: string, paymentMethod: string): string {
  // Extract first contiguous sequence of digits/spaces/plus that looks like a phone number
  const digitsOnly = (rawDetails || '').replace(/[^0-9]/g, '');
  if (!digitsOnly) return '';

  // Remove leading 00 if present (e.g., 00229 -> 229)
  const cleaned = digitsOnly.startsWith('00') ? digitsOnly.slice(2) : digitsOnly;

  // If Benin 8-digit or 10-digit local number without country code (e.g. 0197000000 or 97000000)
  const m = (paymentMethod || '').toUpperCase();
  const isBeninDefault =
    !cleaned.startsWith('229') &&
    !cleaned.startsWith('225') &&
    !cleaned.startsWith('228') &&
    !cleaned.startsWith('221') &&
    !cleaned.startsWith('226') &&
    !cleaned.startsWith('242');

  if (isBeninDefault) {
    if (cleaned.length === 10 && cleaned.startsWith('01')) {
      return `229${cleaned}`;
    }
    if (cleaned.length === 8 && !m.includes('CI') && !m.includes('SN') && !m.includes('TG')) {
      return `22901${cleaned}`;
    }
  }

  // If 229 + 8 digits (old Benin format without 01 prefix), automatically insert 01 for FeexPay
  if (cleaned.startsWith('229') && cleaned.length === 11) {
    return `22901${cleaned.slice(3)}`;
  }

  return cleaned;
}

/**
 * Resolves the FeexPay Payout endpoint and network code from paymentMethod and normalized phone number
 */
export function resolveFeexPayEndpointAndNetwork(
  paymentMethod: string,
  phoneNumber: string
): { endpoint: string; network?: string } | null {
  const m = (paymentMethod || '').toUpperCase();

  // Check country prefix from phone number
  if (phoneNumber.startsWith('228') || m.includes('TOGO') || m.includes('TMONEY')) {
    return {
      endpoint: '/api/payouts/public/togo',
      network: m.includes('MOOV') ? 'MOOV' : 'TOGOCOM',
    };
  }

  if (phoneNumber.startsWith('225') || m.includes('CI') || m.includes('IVOIRE')) {
    if (m.includes('ORANGE')) return { endpoint: '/api/payouts/public/orange_ci' };
    if (m.includes('MOOV')) return { endpoint: '/api/payouts/public/moov_ci' };
    if (m.includes('WAVE')) return { endpoint: '/api/payouts/public/wave_ci' };
    return { endpoint: '/api/payouts/public/mtn_ci' };
  }

  if (phoneNumber.startsWith('221') || m.includes('SN') || m.includes('SENEGAL')) {
    if (m.includes('FREE')) return { endpoint: '/api/payouts/public/free_sn' };
    if (m.includes('WAVE')) return { endpoint: '/api/payouts/public/wave_sn' };
    return { endpoint: '/api/payouts/public/orange_sn' };
  }

  if (phoneNumber.startsWith('226') || m.includes('BF') || m.includes('BURKINA')) {
    if (m.includes('MOOV')) return { endpoint: '/api/payouts/public/moov_bf' };
    if (m.includes('WAVE')) return { endpoint: '/api/payouts/public/wave_bf' };
    return { endpoint: '/api/payouts/public/orange_bf' };
  }

  if (phoneNumber.startsWith('242') || m.includes('CG') || m.includes('CONGO')) {
    return { endpoint: '/api/payouts/public/mtn_cg' };
  }

  // Default: Benin (+229) or Wave
  if (m.includes('CELTIIS')) {
    return {
      endpoint: '/api/payouts/public/celtiis_bj',
      network: 'CELTIIS BJ',
    };
  }

  if (m.includes('WAVE')) {
    return { endpoint: '/api/payouts/public/wave_ci' };
  }

  if (m.includes('ORANGE')) {
    return { endpoint: '/api/payouts/public/orange_ci' };
  }

  if (m.includes('MOOV')) {
    return {
      endpoint: '/api/payouts/public/transfer/global',
      network: 'MOOV',
    };
  }

  if (m.includes('MTN')) {
    return {
      endpoint: '/api/payouts/public/transfer/global',
      network: 'MTN',
    };
  }

  return null;
}

export interface FeexPayPayoutResult {
  success: boolean;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  feexReference?: string;
  amountXof: number;
  phoneNumber: string;
  message: string;
  raw?: any;
}

/**
 * Executes an outgoing Mobile Money transfer via FeexPay Payout API
 */
export async function executeFeexPayPayout(params: {
  paymentMethod: string;
  paymentDetails: string;
  amountUsd: number;
  reference: string;
  email?: string;
}): Promise<FeexPayPayoutResult> {
  const config = await getFeexPayConfig();
  const amountXof = convertUsdToXof(params.amountUsd);
  const phoneNumber = normalizePayoutPhoneNumber(params.paymentDetails, params.paymentMethod);

  if (!phoneNumber || phoneNumber.length < 10) {
    return {
      success: false,
      status: 'FAILED',
      amountXof,
      phoneNumber,
      message: `Numéro de téléphone invalide pour FeexPay Payout (${params.paymentDetails}). Format attendu : indicatif + numéro (ex: 2290197000000).`,
    };
  }

  const routeInfo = resolveFeexPayEndpointAndNetwork(params.paymentMethod, phoneNumber);
  if (!routeInfo) {
    return {
      success: false,
      status: 'FAILED',
      amountXof,
      phoneNumber,
      message: `La méthode "${params.paymentMethod}" n'est pas éligible au virement automatique FeexPay.`,
    };
  }

  const motif = `Retrait ${params.reference}`.replace(/[^a-zA-Z0-9 ]/g, '').trim();

  const payload: Record<string, any> = {
    phoneNumber,
    amount: amountXof,
    shop: config.shopId,
    motif,
    custom_id: params.reference,
  };

  if (routeInfo.network) {
    payload.network = routeInfo.network;
  }
  if (params.email) {
    payload.email = params.email;
  }

  // Determine base URL based on shopId format (24-hex is v1, shorter alphanumeric is v2), try primary then fallback
  const isV1ShopId = /^[a-f0-9]{24}$/i.test(config.shopId);
  const baseUrls = isV1ShopId
    ? ['https://api.feexpay.me', 'https://api-v2.feexpay.me']
    : ['https://api-v2.feexpay.me', 'https://api.feexpay.me'];

  let lastData: any = null;
  let lastErrorMsg = 'Erreur lors de la communication avec FeexPay Payout API';

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}${routeInfo.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      lastData = data;

      const txStatus = String(data.status || '').toUpperCase();
      if (response.ok && (txStatus === 'SUCCESSFUL' || txStatus === 'SUCCESS' || data.reference)) {
        const isPending = txStatus === 'PENDING' || txStatus === 'IN_PROGRESS';
        if (txStatus === 'FAILED') {
          return {
            success: false,
            status: 'FAILED',
            amountXof,
            phoneNumber,
            feexReference: data.reference,
            message: data.message || 'Le transfert FeexPay a échoué.',
            raw: data,
          };
        }

        return {
          success: !isPending,
          status: isPending ? 'PENDING' : 'SUCCESSFUL',
          feexReference: data.reference || params.reference,
          amountXof,
          phoneNumber,
          message: isPending
            ? `Transfert FeexPay initié et en cours de traitement (${amountXof} FCFA vers ${phoneNumber}).`
            : `Transfert automatique FeexPay réussi (${amountXof} FCFA envoyés au ${phoneNumber}) !`,
          raw: data,
        };
      }

      if (data.message) {
        lastErrorMsg = Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
      }
      // If it's a business error (e.g. insufficient merchant balance or invalid phone), don't retry on the other base URL
      if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 422) {
        break;
      }
    } catch (err: any) {
      lastErrorMsg = err.message || lastErrorMsg;
    }
  }

  return {
    success: false,
    status: 'FAILED',
    amountXof,
    phoneNumber,
    message: `FeexPay Payout: ${lastErrorMsg}`,
    raw: lastData,
  };
}
