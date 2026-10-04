async function testFeexPayCardOrders() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  // Test GET order on checkout.feexpay.me
  const testIds = ['TK-779565', 'test', shopId];
  for (const id of testIds) {
    const url = `https://checkout.feexpay.me/api/card/public/order/${id}`;
    const res = await fetch(url);
    console.log('GET', url, '-> Status:', res.status, await res.text().catch(e => e.message));
  }

  // Let's check how an order is created on checkout.feexpay.me or api.feexpay.me!
  const createEndpoints = [
    'https://checkout.feexpay.me/api/card/public/order',
    'https://checkout.feexpay.me/api/card/order',
    'https://checkout.feexpay.me/api/order',
    'https://checkout.feexpay.me/api/v1/order',
    'https://feexpay.me/api/card/public/order',
    'https://feexpay.me/api/v1/request/payment',
    'https://feexpay.me/api/shop/' + shopId + '/request'
  ];

  for (const ep of createEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
          'x-api-key': apiKey,
          'token': apiKey
        },
        body: JSON.stringify({
          shop: shopId,
          shop_id: shopId,
          id: shopId,
          amount: 5000,
          custom_id: 'TK-123456',
          order_id: 'TK-123456',
          ref: 'TK-123456',
          callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback'
        })
      });
      console.log('POST', ep, '-> Status:', res.status, await res.text().catch(e => e.message));
    } catch(e) {
      console.log('POST ERR:', ep, e.message);
    }
  }
}

testFeexPayCardOrders();
