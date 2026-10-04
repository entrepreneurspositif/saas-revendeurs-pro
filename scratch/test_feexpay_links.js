async function testLinks() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const amount = 5000;
  const customId = 'TK-779565';
  const callbackUrl = encodeURIComponent('https://revente-abonnement.vercel.app/api/feexpay/callback');

  const baseUrls = [
    'https://feexpay.me/pay',
    'https://feexpay.me/checkout',
    'https://feexpay.me/fr/checkout',
    'https://checkout.feexpay.me/pay',
    'https://checkout.feexpay.me/',
    'https://checkout.feexpay.me/checkout',
    'https://app.feexpay.me/pay',
    'https://app.feexpay.me/checkout',
    'https://feexpay.me/payment',
    'https://checkout.feexpay.me/payment'
  ];

  const query = `id=${shopId}&token=${apiKey}&amount=${amount}&custom_id=${customId}&callback_url=${callbackUrl}`;

  for (const b of baseUrls) {
    try {
      const url = `${b}?${query}`;
      const res = await fetch(url, { redirect: 'manual' });
      console.log(b, '-> Status:', res.status, 'Location:', res.headers.get('location'));
    } catch(e) {
      console.log(b, 'Err:', e.message);
    }
  }
}

testLinks();
