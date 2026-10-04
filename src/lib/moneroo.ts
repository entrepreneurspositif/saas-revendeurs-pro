import { prisma } from '@/lib/prisma';

export interface MonerooConfig {
  secretKey: string;
  enabled: boolean;
}

export const DEFAULT_MONEROO_SECRET_KEY = 'pvk_sandbox_r46iyu|01M43647C70K9342SV9X9NS32M';

export async function getMonerooConfig(): Promise<MonerooConfig> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['moneroo_secret_key', 'moneroo_enabled'],
        },
      },
    });

    const map = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value?.trim();
      return acc;
    }, {} as Record<string, string>);

    return {
      secretKey: map['moneroo_secret_key'] || DEFAULT_MONEROO_SECRET_KEY,
      enabled: map['moneroo_enabled'] !== 'false',
    };
  } catch (e) {
    return {
      secretKey: DEFAULT_MONEROO_SECRET_KEY,
      enabled: true,
    };
  }
}

export interface MonerooInitParams {
  amount: number;
  currency?: string;
  ticketCode: string;
  description?: string;
  customerEmail?: string;
  customerName?: string;
  returnUrl: string;
}

export async function initializeMonerooPayment(params: MonerooInitParams) {
  const config = await getMonerooConfig();

  if (!config.secretKey) {
    throw new Error('La clé secrète Moneroo n\'est pas configurée.');
  }

  const currency = (params.currency || 'USD').toUpperCase();
  const customerEmail = params.customerEmail || 'client@revente-abonnement.com';
  const customerName = (params.customerName || 'Client Reseller').trim();
  const nameParts = customerName.split(' ');
  const firstName = nameParts[0] || 'Client';
  const lastName = nameParts.slice(1).join(' ') || 'Anonyme';

  // Sanitize description
  const cleanDesc = (params.description || `Commande ${params.ticketCode}`)
    .replace(/[^\w\s-]/gi, '')
    .trim() || `Commande ${params.ticketCode}`;

  const payload = {
    amount: params.amount,
    currency,
    description: cleanDesc,
    customer: {
      email: customerEmail,
      first_name: firstName,
      last_name: lastName,
    },
    return_url: params.returnUrl,
    metadata: {
      ticketCode: params.ticketCode,
    },
  };

  const response = await fetch('https://api.moneroo.io/v1/payments/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.data?.checkout_url) {
    console.error('Moneroo API Error:', data);
    const errorMsg = data.message || 'Erreur lors de l\'initialisation de Moneroo';
    throw new Error(errorMsg);
  }

  return {
    paymentId: data.data.id,
    checkoutUrl: data.data.checkout_url,
  };
}

export async function verifyMonerooPayment(paymentId: string) {
  const config = await getMonerooConfig();

  if (!config.secretKey || !paymentId) {
    return null;
  }

  const response = await fetch(`https://api.moneroo.io/v1/payments/${paymentId}/verify`, {
    headers: {
      'Authorization': `Bearer ${config.secretKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  return data.data || null;
}
