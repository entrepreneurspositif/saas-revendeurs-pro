async function testV2Endpoints() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const baseUrl = 'https://api-v2.feexpay.me';

  const endpoints = [
    '/api/feexlinks/generate',
    '/api/feexlink/generate',
    '/api/create-payment',
    '/api/checkout',
    '/api/payments',
    '/api/public/card',
    '/api/transactions/requesttopay',
    '/api/transactions/public/requesttopay',
    '/api/card/public/order',
    '/api/transactions/public/card',
    '/api/shop/' + shopId + '/request'
  ];

  for (const ep of endpoints) {
    try {
      const url = baseUrl + ep;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'token': apiKey,
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          shop: shopId,
          amount: 5000,
          custom_id: 'TK-123456',
          description: 'Achat Abonnement',
          callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback',
          callback_info: 'TK-123456',
          currency: 'XOF'
        })
      });
      console.log('POST', url, '-> Status:', res.status);
      const text = await res.text();
      console.log('Body:', text.slice(0, 300));
    } catch(e) {
      console.log('Err:', ep, e.message);
    }
  }
}

testV2Endpoints();
