async function testCallbackParam() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const url = 'https://api-v2.feexpay.me/api/feexlinks/generate';

  const ticketCode = 'TK-TEST-CALLBACK-123';
  const callbackUrl = `https://revente-abonnement.vercel.app/api/feexpay/callback?custom_id=${ticketCode}&ticketCode=${ticketCode}`;
  const callbackErrorUrl = `https://revente-abonnement.vercel.app/api/feexpay/callback?custom_id=${ticketCode}&status=FAILED`;

  const payload = {
    shop: shopId,
    amount: 1000,
    description: `Test callback ${ticketCode}`,
    paymentMethod: 'ALL',
    expireIn: 60,
    range: 0,
    custom_id: ticketCode,
    callback_url: callbackUrl,
    callback_error: callbackErrorUrl
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Generated FeexLink:', data);
  console.log('Callback URL embedded:', data.callback_url);
}

testCallbackParam();
