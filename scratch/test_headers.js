async function testApiFeexPay() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  const urls = [
    'https://api.feexpay.me/v1/request/payment',
    'https://api.feexpay.me/',
    'https://api.feexpay.me/v1/shop',
    'https://api.feexpay.me/api/v1/shop',
    'https://api.feexpay.me/health'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      console.log('GET', url, res.status, res.statusText);
      const text = await res.text();
      console.log('Response:', text.slice(0, 300));
    } catch(e) {
      console.log('Error GET:', url, e.message);
    }
  }
}

testApiFeexPay();
