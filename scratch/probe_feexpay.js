const https = require('https');

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";

const endpoints = [
  // api.feexpay.me
  { url: 'https://api.feexpay.me/v1/request_to_pay', method: 'POST' },
  { url: 'https://api.feexpay.me/v1/requesttopay', method: 'POST' },
  { url: 'https://api.feexpay.me/v1/payment/init', method: 'POST' },
  { url: 'https://api.feexpay.me/v1/pay', method: 'POST' },
  { url: 'https://api.feexpay.me/api/v1/requesttopay', method: 'POST' },
  { url: 'https://api.feexpay.me/api/v1/init', method: 'POST' },
  
  // feexpay.me
  { url: 'https://feexpay.me/api/v1/requesttopay', method: 'POST' },
  { url: 'https://feexpay.me/api/v1/pay', method: 'POST' },
  { url: 'https://feexpay.me/api/v1/payment/init', method: 'POST' },
  { url: 'https://feexpay.me/api/requesttopay', method: 'POST' },
  { url: 'https://feexpay.me/api/pay', method: 'POST' },
  { url: 'https://feexpay.me/v1/requesttopay', method: 'POST' },

  // GET urls
  { url: `https://feexpay.me/pay/${shopId}`, method: 'GET' },
  { url: `https://feexpay.me/checkout/${shopId}`, method: 'GET' },
  { url: `https://feexpay.me/payment/${shopId}`, method: 'GET' },
  { url: `https://feexpay.me/payin/${shopId}`, method: 'GET' },
  { url: `https://feexpay.me/p/${shopId}`, method: 'GET' },
  { url: `https://feexpay.me/link/${shopId}`, method: 'GET' },
];

const payload = {
  token: apiKey,
  shop: shopId,
  shop_id: shopId,
  amount: 1000,
  custom_id: "test1234",
  callback_url: "https://revente-abonnement.vercel.app/api/feexpay/callback"
};

async function test(ep) {
  return new Promise((resolve) => {
    const u = new URL(ep.url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: ep.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'token': apiKey
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[${ep.method}] ${ep.url} => Status: ${res.statusCode}`);
        if (res.headers.location) console.log(`   Location: ${res.headers.location}`);
        if (res.statusCode !== 404 && res.statusCode !== 502) {
          console.log(`   Body: ${body.substring(0, 300)}`);
        }
        resolve();
      });
    });
    req.on('error', err => {
      console.log(`[${ep.method}] ${ep.url} Error: ${err.message}`);
      resolve();
    });
    if (ep.method === 'POST') req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  for (const ep of endpoints) {
    await test(ep);
  }
}

main();
