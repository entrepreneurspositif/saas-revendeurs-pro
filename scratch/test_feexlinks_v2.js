async function testFeexLinksV2() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const url = 'https://api-v2.feexpay.me/api/feexlinks/generate';

  const payload = {
    shop: shopId,
    amount: 5000,
    description: 'Commande TK-779565',
    paymentMethod: 'ALL',
    expireIn: 60,
    range: 0,
    custom_id: 'TK-779565',
    callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback',
    callback_error: 'https://revente-abonnement.vercel.app/api/feexpay/callback?status=FAILED'
  };

  console.log('Sending payload to:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Response Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Response Data:', JSON.stringify(data, null, 2));
}

testFeexLinksV2();
