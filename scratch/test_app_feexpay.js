async function testAppFeexPay() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  const urls = [
    'https://app.feexpay.me/api',
    'https://app.feexpay.me/api/v1',
    'https://app.feexpay.me/api/request/payment',
    'https://app.feexpay.me/api/v1/request/payment',
    'https://app.feexpay.me/api/shop/' + shopId,
    'https://app.feexpay.me/api/v1/shop/' + shopId,
    'https://feexpay.me/api/v1/request/payment',
    'https://feexpay.me/pay',
    'https://feexpay.me/fr/pay'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'token': apiKey
        },
        body: JSON.stringify({
          shop: shopId,
          amount: 1000,
          custom_id: 'TK-123456'
        })
      });
      console.log('POST', url, res.status, res.statusText);
      const text = await res.text();
      console.log('Response snippet:', text.slice(0, 200));
    } catch(e) {
      console.log('Error POST:', url, e.message);
    }
  }
}

testAppFeexPay();
