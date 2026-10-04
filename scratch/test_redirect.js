async function testRedirectFollow() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const amount = 5000;
  const customId = 'TK-779565';
  const callbackUrl = encodeURIComponent('https://revente-abonnement.vercel.app/api/feexpay/callback');

  const targetUrl = `https://feexpay.me/pay?id=${shopId}&token=${apiKey}&amount=${amount}&custom_id=${customId}&callback_url=${callbackUrl}`;

  console.log('Testing URL:', targetUrl);
  const res = await fetch(targetUrl, { redirect: 'follow' });
  console.log('Final URL after redirects:', res.url);
  console.log('Final Status:', res.status);
  const text = await res.text();
  console.log('Final HTML length:', text.length);
  console.log('Snippet:', text.slice(0, 500));
}

testRedirectFollow();
