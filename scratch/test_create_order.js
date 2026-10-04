async function testCreateOrder() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  const endpoints = [
    'https://checkout.feexpay.me/api/card/public/order',
    'https://checkout.feexpay.me/api/card/order',
    'https://checkout.feexpay.me/api/card/init',
    'https://checkout.feexpay.me/api/order',
    'https://checkout.feexpay.me/api/payment',
    'https://checkout.feexpay.me/api/v1/order',
    'https://checkout.feexpay.me/api/v1/request/payment',
    'https://checkout.feexpay.me/api/v1/payment/request'
  ];

  const bodies = [
    { shop: shopId, amount: 5000, custom_id: 'TK-123456', callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback' },
    { shop_id: shopId, amount: 5000, order_id: 'TK-123456' },
    { id: shopId, token: apiKey, amount: 5000, ref: 'TK-123456' }
  ];

  for (const ep of endpoints) {
    for (const b of bodies) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'x-api-key': apiKey,
            'token': apiKey
          },
          body: JSON.stringify(b)
        });
        if (res.status !== 404) {
          console.log('INTERESTING:', ep, '-> Status:', res.status, await res.text().catch(e => e.message));
        }
      } catch(e) {
        // ignore
      }
    }
  }
  console.log('Test completed.');
}

testCreateOrder();
