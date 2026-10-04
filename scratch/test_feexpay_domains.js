const fetch = require('node-fetch');

const API_KEY = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const SHOP_ID = "673db7093c2872d9f60742de";

async function probeDomains() {
  const domains = [
    "https://api.feexpay.me",
    "https://app.feexpay.me",
    "https://feexpay.me",
    "https://backend.feexpay.me",
    "https://api.feexpay.com",
  ];

  const subpaths = [
    "/v1/merchant/request/payment",
    "/api/v1/merchant/request/payment",
    "/api/request/payment",
    "/feexpay-javascript-sdk/index.js",
    "/sdk/feexpay.js",
    "/js/feexpay.js",
    "/v1/shop/" + SHOP_ID,
    "/api/shop/" + SHOP_ID
  ];

  for (const domain of domains) {
    for (const sub of subpaths) {
      const targetUrl = domain + sub;
      try {
        const res = await fetch(targetUrl, {
          method: sub.includes("index.js") || sub.includes("feexpay.js") || sub.includes("shop") ? "GET" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
          },
          body: sub.includes("index.js") || sub.includes("feexpay.js") || sub.includes("shop") ? undefined : JSON.stringify({
            token: API_KEY,
            id: SHOP_ID,
            amount: 100,
            callback_url: "https://revente-abonnement.vercel.app/api/feexpay/callback",
            custom_id: "TEST-123"
          }),
          timeout: 4000
        });

        console.log(`[${res.status}] ${targetUrl} -> Header: ${res.headers.get("content-type")}`);
        if (res.status !== 502 && res.status !== 404 && res.status !== 500) {
          const body = await res.text();
          console.log(`>>> VALID RESPONSE from ${targetUrl}:\n${body.slice(0, 300)}\n`);
        }
      } catch (err) {
        // console.log(`[ERR] ${targetUrl}: ${err.message}`);
      }
    }
  }
}

probeDomains();
