async function testExtractedEndpoints() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  const hosts = [
    'https://api.feexpay.me',
    'https://api-v2.feexpay.me',
    'https://feexpay.me',
    'https://checkout.feexpay.me',
    'https://app.feexpay.me',
    'https://app-v2.feexpay.me'
  ];

  const endpoints = [
    '/api/public/card',
    '/api/feexlinks/generate',
    '/api/create-payment',
    '/api/checkout',
    '/api/balance/public/getByShop/' + shopId
  ];

  for (const h of hosts) {
    for (const ep of endpoints) {
      try {
        const url = h + ep;
        const res = await fetch(url, {
          method: ep.includes('getByShop') ? 'GET' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'token': apiKey,
            'x-api-key': apiKey
          },
          body: ep.includes('getByShop') ? undefined : JSON.stringify({
            shop: shopId,
            amount: 5000,
            custom_id: 'TK-123456',
            callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback'
          })
        });
        console.log(url, '-> Status:', res.status);
        if (res.status !== 502 && res.status !== 404 && res.status !== 500) {
          console.log('SUCCESS/BODY:', await res.text().catch(e => e.message));
        } else if (res.status === 400 || res.status === 401 || res.status === 403) {
          console.log('AUTH/PARAMS HIT:', await res.text().catch(e => e.message));
        }
      } catch(e) {
        // console.log(h + ep, 'Err:', e.message);
      }
    }
  }
}

testExtractedEndpoints();
