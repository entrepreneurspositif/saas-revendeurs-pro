function sanitizeDescription(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim();
}

async function testInitFlow() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  
  const rawDesc = 'Achat Netflix Premium (Édition Spéciale) - TK-998877';
  const cleanDesc = sanitizeDescription(rawDesc);
  console.log('Raw:', rawDesc);
  console.log('Cleaned:', cleanDesc);

  const payload = {
    shop: shopId,
    amount: 14625,
    description: cleanDesc,
    paymentMethod: 'ALL',
    expireIn: 60,
    range: 0,
    custom_id: 'TK-998877',
    callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback',
    callback_error: 'https://revente-abonnement.vercel.app/api/feexpay/callback?status=FAILED'
  };

  const res = await fetch('https://api-v2.feexpay.me/api/feexlinks/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
  if (data.urlPay) {
    console.log('SUCCESS! Generated URL:', data.urlPay);
  }
}

testInitFlow();
