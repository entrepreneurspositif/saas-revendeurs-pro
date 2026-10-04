async function testNoOrderId() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const amount = 5000;
  const customId = 'TK-779565';
  const callbackUrl = encodeURIComponent('https://revente-abonnement.vercel.app/api/feexpay/callback');

  const testUrls = [
    `https://checkout.feexpay.me/checkout/card-details?id=${shopId}&shop=${shopId}&token=${apiKey}&apiKey=${apiKey}&amount=${amount}&custom_id=${customId}&callback_url=${callbackUrl}`,
    `https://checkout.feexpay.me/checkout/card-details?shop=${shopId}&amount=${amount}&custom_id=${customId}&callback_url=${callbackUrl}`,
    `https://checkout.feexpay.me/checkout/card-details?id=${shopId}&amount=${amount}&custom_id=${customId}&callback_url=${callbackUrl}`
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url);
      console.log('GET', url);
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Text length:', text.length, 'Contains orderNotFound:', text.includes('orderNotFound') || text.includes('introuvable'));
    } catch(e) {
      console.log('Err:', e.message);
    }
  }
}

testNoOrderId();
