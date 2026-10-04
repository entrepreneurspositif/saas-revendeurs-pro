const fetch = require('node-fetch');

const API_KEY = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const SHOP_ID = "673db7093c2872d9f60742de";

async function testFeexPayEndpoints() {
  console.log("Testing FeexPay API with key and shop ID...");

  const endpointsToTest = [
    { url: "https://api.feexpay.me/v1/merchant/request/payment", method: "POST" },
    { url: "https://api.feexpay.me/v1/payments/init", method: "POST" },
    { url: "https://api.feexpay.me/v1/request/payment", method: "POST" },
    { url: "https://api.feexpay.me/v1/shop/" + SHOP_ID, method: "GET" },
    { url: "https://api.feexpay.me/v1/merchant/shop/" + SHOP_ID, method: "GET" },
  ];

  const payload = {
    token: API_KEY,
    id: SHOP_ID,
    amount: 100,
    currency: "XOF",
    callback_url: "https://revente-abonnement.vercel.app/api/feexpay/callback",
    custom_id: "TEST-TICKET-123",
    description: "Test paiement FeexPay"
  };

  for (const ep of endpointsToTest) {
    try {
      const options = {
        method: ep.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "x-api-key": API_KEY,
        }
      };
      if (ep.method === "POST") {
        options.body = JSON.stringify(payload);
      }
      console.log(`\nTesting ${ep.method} ${ep.url}...`);
      const res = await fetch(ep.url, options);
      const status = res.status;
      const text = await res.text();
      console.log(`Status: ${status}`);
      console.log(`Response: ${text.slice(0, 300)}`);
    } catch (err) {
      console.error(`Error testing ${ep.url}:`, err.message);
    }
  }
}

testFeexPayEndpoints();
