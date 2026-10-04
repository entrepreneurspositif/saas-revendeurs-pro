function convertUsdToXofTest(amountUsd) {
  const rate = 650;
  const rawXof = Math.round(Number(amountUsd || 0) * rate);
  return Math.max(50, Math.round(rawXof));
}

function sanitizeDescription(str) {
  if (!str) return 'Commande';
  const clean = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean || 'Commande';
}

async function testEdgeCases() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const url = 'https://api-v2.feexpay.me/api/feexlinks/generate';

  const testCases = [
    { usd: 0.01, title: 'SMS OTP Telegram (0.01$)' },
    { usd: 0.05, title: 'Service SMS cheap $0.05' },
    { usd: 0.25, title: 'Abonnement #1 (Promo 50%)!' },
    { usd: 1.99, title: 'Netflix 1 Mois (Édition + 4K HD)' },
    { usd: 10.50, title: 'IPTV Premium - 12 Mois [4K/FHD]' },
    { usd: 50.00, title: 'Pack Reseller (Pro & Ultimate)' }
  ];

  for (const tc of testCases) {
    const amountXof = convertUsdToXofTest(tc.usd);
    const desc = sanitizeDescription(tc.title);
    
    console.log(`\nTesting USD $${tc.usd} -> XOF ${amountXof} | Raw: "${tc.title}" -> Clean: "${desc}"`);

    const payload = {
      shop: shopId,
      amount: amountXof,
      description: desc,
      paymentMethod: 'ALL',
      expireIn: 60,
      range: 0,
      custom_id: `TK-EDGE-${Math.floor(Math.random() * 100000)}`,
      callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback'
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && (data.urlPay || data.url)) {
      console.log(`✅ SUCCESS:`, data.urlPay || data.url);
    } else {
      console.log(`❌ ERROR ${res.status}:`, JSON.stringify(data));
    }
  }
}

testEdgeCases();
