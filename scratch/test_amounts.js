async function testAmounts() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const url = 'https://api-v2.feexpay.me/api/feexlinks/generate';

  const amountsToTest = [
    0,
    1,
    10,
    50,
    65, // ~0.10 USD
    100,
    325, // ~0.50 USD
    500,
    650, // 1 USD
    650.5,
    1000
  ];

  for (const amt of amountsToTest) {
    const payload = {
      shop: shopId,
      amount: amt,
      description: `Test amount ${amt}`,
      paymentMethod: 'ALL',
      expireIn: 60,
      range: 0,
      custom_id: `TK-TEST-${amt}`,
      callback_url: 'https://revente-abonnement.vercel.app/api/feexpay/callback'
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      console.log(`Amount: ${amt} -> Status: ${res.status}`);
      const data = await res.json();
      if (!res.ok) {
        console.log(`Amount: ${amt} ERROR:`, JSON.stringify(data));
      } else {
        console.log(`Amount: ${amt} SUCCESS:`, data.urlPay);
      }
    } catch(e) {
      console.log(`Amount: ${amt} EXCEPTION:`, e.message);
    }
  }
}

testAmounts();
