async function testLargeAmounts() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';
  const url = 'https://api-v2.feexpay.me/api/feexlinks/generate';

  const amountsToTest = [
    50000,   // ~77 USD
    100000,  // ~153 USD
    500000,  // ~769 USD
    1000000, // ~1538 USD
    5000000, // ~7692 USD
    10000000 // ~15384 USD
  ];

  for (const amt of amountsToTest) {
    const payload = {
      shop: shopId,
      amount: amt,
      description: `Test large amount ${amt}`,
      paymentMethod: 'ALL',
      expireIn: 60,
      range: 0,
      custom_id: `TK-LARGE-${amt}`,
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

testLargeAmounts();
