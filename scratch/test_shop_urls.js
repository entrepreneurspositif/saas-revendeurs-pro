async function testShopUrls() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  const testUrls = [
    `https://checkout.feexpay.me/shop/${shopId}`,
    `https://checkout.feexpay.me/pay/${shopId}`,
    `https://checkout.feexpay.me/checkout/${shopId}`,
    `https://checkout.feexpay.me/card/${shopId}`,
    `https://feexpay.me/shop/${shopId}`,
    `https://feexpay.me/pay/${shopId}`,
    `https://checkout.feexpay.me/?id=${shopId}`,
    `https://checkout.feexpay.me/?shop=${shopId}`
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      console.log(url, '-> Status:', res.status, 'Location:', res.headers.get('location'));
    } catch(e) {
      console.log(url, 'Err:', e.message);
    }
  }
}

testShopUrls();
