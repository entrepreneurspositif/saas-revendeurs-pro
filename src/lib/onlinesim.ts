import { prisma } from '@/lib/prisma';

export interface OtpService {
  code: string;
  name: string;
  category: string;
  icon?: string;
  priceUSD: number;
  stock: number;
}

export interface OtpCountry {
  code: string;
  name: string;
  flag: string;
  prefix: string;
}

export const POPULAR_COUNTRIES: OtpCountry[] = [
  { code: '1', name: 'États-Unis / Canada', flag: '🇺🇸', prefix: '+1' },
  { code: '33', name: 'France', flag: '🇫🇷', prefix: '+33' },
  { code: '44', name: 'Royaume-Uni', flag: '🇬🇧', prefix: '+44' },
  { code: '49', name: 'Allemagne', flag: '🇩🇪', prefix: '+49' },
  { code: '225', name: "Côte d'Ivoire", flag: '🇨🇮', prefix: '+225' },
  { code: '221', name: 'Sénégal', flag: '🇸🇳', prefix: '+221' },
  { code: '237', name: 'Cameroun', flag: '🇨🇲', prefix: '+237' },
  { code: '212', name: 'Maroc', flag: '🇲🇦', prefix: '+212' },
  { code: '7', name: 'Russie', flag: '🇷🇺', prefix: '+7' },
  { code: '34', name: 'Espagne', flag: '🇪🇸', prefix: '+34' },
  { code: '39', name: 'Italie', flag: '🇮🇹', prefix: '+39' },
  { code: '55', name: 'Brésil', flag: '🇧🇷', prefix: '+55' },
  { code: '91', name: 'Inde', flag: '🇮🇳', prefix: '+91' },
  { code: '62', name: 'Indonésie', flag: '🇮🇩', prefix: '+62' },
];

export const FALLBACK_SERVICES: OtpService[] = [
  { code: 'whatsapp', name: 'WhatsApp / Business', category: 'Messagerie', priceUSD: 0.35, stock: 450 },
  { code: 'telegram', name: 'Telegram', category: 'Messagerie', priceUSD: 0.45, stock: 620 },
  { code: 'openai', name: 'ChatGPT / OpenAI', category: 'IA & APIs', priceUSD: 0.50, stock: 310 },
  { code: 'google', name: 'Google / Gmail / YouTube', category: 'Comptes & Outils', priceUSD: 0.30, stock: 890 },
  { code: 'instagram', name: 'Instagram / Threads', category: 'Réseaux Sociaux', priceUSD: 0.25, stock: 540 },
  { code: 'tiktok', name: 'TikTok', category: 'Réseaux Sociaux', priceUSD: 0.30, stock: 410 },
  { code: 'facebook', name: 'Facebook / Meta', category: 'Réseaux Sociaux', priceUSD: 0.25, stock: 780 },
  { code: 'discord', name: 'Discord', category: 'Messagerie', priceUSD: 0.25, stock: 390 },
  { code: 'binance', name: 'Binance / Crypto', category: 'Finance', priceUSD: 0.60, stock: 210 },
  { code: 'netflix', name: 'Netflix', category: 'Divertissement', priceUSD: 0.40, stock: 180 },
  { code: 'amazon', name: 'Amazon / AWS', category: 'E-commerce', priceUSD: 0.35, stock: 430 },
  { code: 'paypal', name: 'PayPal', category: 'Finance', priceUSD: 0.55, stock: 150 },
  { code: 'twitter', name: 'X / Twitter', category: 'Réseaux Sociaux', priceUSD: 0.30, stock: 320 },
  { code: 'apple', name: 'Apple ID / iCloud', category: 'Comptes & Outils', priceUSD: 0.45, stock: 260 },
  { code: 'uber', name: 'Uber / Eats', category: 'Services', priceUSD: 0.25, stock: 290 },
  { code: 'snapchat', name: 'Snapchat', category: 'Réseaux Sociaux', priceUSD: 0.25, stock: 340 },
  { code: 'linkedin', name: 'LinkedIn', category: 'Réseaux Sociaux', priceUSD: 0.35, stock: 220 },
  { code: 'claude', name: 'Anthropic / Claude AI', category: 'IA & APIs', priceUSD: 0.55, stock: 190 },
];

export async function getOnlineSimConfig() {
  try {
    const keySetting = await prisma.setting.findUnique({ where: { key: 'ONLINESIM_API_KEY' } });
    const userSetting = await prisma.setting.findUnique({ where: { key: 'ONLINESIM_USER_ID' } });
    const marginSetting = await prisma.setting.findUnique({ where: { key: 'ONLINESIM_MARGIN_PERCENT' } });
    
    const apiKey = keySetting?.value || process.env.ONLINESIM_API_KEY || 'D7b35U1V9w7fAUr-wh87r8Bj-8k17Le4u-jGg3HshL-XY7kS1faZRZ9gQW';
    const userId = userSetting?.value || '780784';
    const marginPercent = marginSetting ? parseFloat(marginSetting.value) : 30;
    
    return { apiKey, userId, marginPercent };
  } catch (e) {
    return { apiKey: 'D7b35U1V9w7fAUr-wh87r8Bj-8k17Le4u-jGg3HshL-XY7kS1faZRZ9gQW', userId: '780784', marginPercent: 30 };
  }
}

export async function getOnlineSimBalance(providedKey?: string) {
  let apiKey = providedKey;
  if (!apiKey) {
    const config = await getOnlineSimConfig();
    apiKey = config.apiKey;
  }
  if (!apiKey) return { success: false, balance: 0, message: 'Clé API non renseignée' };

  try {
    const url = `https://onlinesim.io/api/getBalance.php?apikey=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (data.response === '1' || data.balance !== undefined) {
      return {
        success: true,
        balance: parseFloat(data.balance || '0'),
      };
    } else {
      return {
        success: false,
        balance: 0,
        message: data.msg || data.response || 'Clé API invalide ou erreur serveur',
      };
    }
  } catch (e: any) {
    return {
      success: false,
      balance: 0,
      message: e.message || 'Erreur réseau OnlineSIM',
    };
  }
}

export async function getOnlineSimTariffs(countryCode: string = '1') {
  const { apiKey, marginPercent } = await getOnlineSimConfig();

  if (!apiKey) {
    return FALLBACK_SERVICES.map((s) => ({
      ...s,
      sellingPriceUSD: parseFloat((s.priceUSD * (1 + marginPercent / 100)).toFixed(2)),
    }));
  }

  try {
    const statsUrl = `https://onlinesim.io/api/getNumbersStats.php?apikey=${apiKey}&country=${countryCode}`;
    const statsRes = await fetch(statsUrl, { cache: 'no-store' });
    const statsData = await statsRes.json();

    if (statsData && statsData.services && Object.keys(statsData.services).length > 0) {
      const servicesList: OtpService[] = [];
      for (const item of Object.values(statsData.services) as any[]) {
        const costPrice = parseFloat(item.price || '0.30');
        const sellingPriceUSD = parseFloat((costPrice * (1 + marginPercent / 100)).toFixed(2));
        const slugCode = String(item.slug || item.id || 'service');
        const name = String(item.service || slugCode);

        let category = 'Comptes & Outils';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('whatsapp') || lowerName.includes('telegram') || lowerName.includes('viber') || lowerName.includes('discord') || lowerName.includes('line')) {
          category = 'Messagerie';
        } else if (lowerName.includes('facebook') || lowerName.includes('instagram') || lowerName.includes('tiktok') || lowerName.includes('twitter') || lowerName.includes('vk') || lowerName.includes('snapchat')) {
          category = 'Réseaux Sociaux';
        } else if (lowerName.includes('google') || lowerName.includes('chatgpt') || lowerName.includes('openai') || lowerName.includes('claude') || lowerName.includes('api') || lowerName.includes('microsoft')) {
          category = 'IA & APIs';
        } else if (lowerName.includes('binance') || lowerName.includes('paypal') || lowerName.includes('crypto') || lowerName.includes('revolut') || lowerName.includes('wise')) {
          category = 'Finance';
        }

        servicesList.push({
          code: slugCode,
          name,
          category,
          priceUSD: costPrice,
          stock: parseInt(item.count || '999', 10),
          sellingPriceUSD,
        } as any);
      }
      if (servicesList.length > 0) return servicesList;
    }
  } catch (e) {
    console.error('OnlineSIM fetch tariffs error:', e);
  }

  return FALLBACK_SERVICES.map((s) => ({
    ...s,
    sellingPriceUSD: parseFloat((s.priceUSD * (1 + marginPercent / 100)).toFixed(2)),
  }));
}

export async function buyOnlineSimNumber(service: string, country: string = '1') {
  const { apiKey, marginPercent } = await getOnlineSimConfig();

  if (!apiKey) {
    // Demo Mode simulation when API key is not configured
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    const countryObj = POPULAR_COUNTRIES.find((c) => c.code === country) || POPULAR_COUNTRIES[0];
    const demoPhone = `${countryObj.prefix}${randomDigits}`;
    const demoTzid = Math.floor(1000000 + Math.random() * 9000000);
    const serviceObj = FALLBACK_SERVICES.find((s) => s.code === service) || FALLBACK_SERVICES[0];
    const costPrice = serviceObj.priceUSD;
    const sellingPrice = parseFloat((costPrice * (1 + marginPercent / 100)).toFixed(2));

    return {
      success: true,
      tzid: demoTzid,
      phone: demoPhone,
      costPrice,
      sellingPrice,
      isDemo: true,
    };
  }

  try {
    const url = `https://onlinesim.io/api/getNum.php?apikey=${apiKey}&service=${service}&country=${country}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (data.response === 1 || data.response === '1' || data.tzid) {
      const tzid = data.tzid;
      let phone = data.number || data.phone || '';
      const costPrice = parseFloat(data.price || '0.30');
      const sellingPrice = parseFloat((costPrice * (1 + marginPercent / 100)).toFixed(2));

      // Fetch state immediately to get the assigned phone number from OnlineSIM!
      if (!phone && tzid) {
        try {
          const stateRes = await fetch(`https://onlinesim.io/api/getState.php?apikey=${apiKey}&tzid=${tzid}&message_to_code=1`, { cache: 'no-store' });
          const stateData = await stateRes.json();
          if (Array.isArray(stateData)) {
            const match = stateData.find((i: any) => i.tzid === tzid) || stateData[0];
            if (match && match.number) {
              phone = match.number;
            }
          }
        } catch (e) {
          console.error('Error fetching state for new tzid:', e);
        }
      }

      return {
        success: true,
        tzid,
        phone,
        costPrice,
        sellingPrice,
        isDemo: false,
      };
    } else {
      let errMsg = 'Stock épuisé ou service indisponible pour ce pays.';
      if (data.response === 'WARNING_LOW_BALANCE') {
        errMsg = 'Solde OnlineSIM insuffisant ou réservé par d\'autres activations en cours.';
      } else if (data.response === 'UNDEFINED_COUNTRY') {
        errMsg = 'Pays non pris en charge pour ce service.';
      } else if (data.msg || typeof data.response === 'string') {
        errMsg = data.msg || data.response;
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Erreur lors de la réservation du numéro.',
    };
  }
}

export async function getOnlineSimState(tzid: number, createdAt?: Date) {
  if (!tzid || tzid === 0) {
    return {
      success: true,
      status: 'PENDING_PAYMENT',
      phone: null,
      smsCode: null,
      fullSms: null,
      timeRemaining: 900,
    };
  }

  const { apiKey } = await getOnlineSimConfig();

  if (!apiKey) {
    // Demo mode: Simulate SMS arrival after 8 seconds
    const elapsedSeconds = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000) : 10;
    if (elapsedSeconds > 6) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        success: true,
        status: 'RECEIVED',
        phone: '+12025550143',
        smsCode: code,
        fullSms: `Votre code de vérification est : ${code}. Ne le partagez avec personne.`,
        timeRemaining: Math.max(0, 900 - elapsedSeconds),
      };
    } else {
      return {
        success: true,
        status: 'WAITING_SMS',
        phone: '+12025550143',
        smsCode: null,
        fullSms: null,
        timeRemaining: 900 - elapsedSeconds,
      };
    }
  }

  try {
    const url = `https://onlinesim.io/api/getState.php?apikey=${apiKey}&tzid=${tzid}&message_to_code=1`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (Array.isArray(data)) {
      const item = data.find((i) => i.tzid === tzid) || data[0];
      if (item) {
        const msg = item.msg || item.sms || null;
        let code = item.code || null;
        if (!code && msg) {
          const match = msg.match(/\b\d{4,8}\b/);
          if (match) code = match[0];
        }

        return {
          success: true,
          status: msg ? 'RECEIVED' : 'WAITING_SMS',
          phone: item.number || item.phone || null,
          smsCode: code,
          fullSms: msg,
          timeRemaining: item.time || 900,
        };
      }
    } else if (typeof data === 'object') {
      const msg = data.msg || data.sms || (data.response === 'TZ_NUM_ANSWER' ? data.msg : null);
      let code = data.code || null;
      if (!code && msg) {
        const match = msg.match(/\b\d{4,8}\b/);
        if (match) code = match[0];
      }

      return {
        success: true,
        status: msg ? 'RECEIVED' : 'WAITING_SMS',
        phone: data.number || data.phone || null,
        smsCode: code,
        fullSms: msg,
        timeRemaining: data.time || 900,
      };
    }

    return {
      success: true,
      status: 'WAITING_SMS',
      phone: null,
      smsCode: null,
      fullSms: null,
      timeRemaining: 900,
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'ERROR',
      message: e.message || 'Erreur lors de la récupération du SMS',
    };
  }
}
