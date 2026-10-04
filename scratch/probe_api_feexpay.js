const https = require('https');

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";

const testPaths = [
  '/api/v1',
  '/v1',
  '/v1/shops',
  '/v1/shops/' + shopId,
  '/v1/merchant',
  '/v1/merchant/requesttopay',
  '/v1/merchant/requesttopay/single',
  '/v1/requesttopay',
  '/v1/payin',
  '/v1/payment',
  '/v1/payments',
  '/v1/orders',
  '/v1/checkout',
  '/v1/custom',
  '/api/requesttopay',
  '/api/payin',
  '/api/payment',
  '/api/shop/' + shopId,
  '/api/shops/' + shopId,
  '/health',
  '/status',
  '/'
];

async function probe(path, method = 'GET') {
  return new Promise((resolve) => {
    const data = method === 'POST' ? JSON.stringify({
      token: apiKey,
      shop: shopId,
      shop_id: shopId,
      amount: 1000,
      custom_id: "TK-123456",
      callback_url: "https://revente-abonnement.vercel.app/api/feexpay/callback"
    }) : null;

    const req = https.request({
      hostname: 'api.feexpay.me',
      path: path,
      method: method,
      headers: {
        'User-Agent': 'FeexPayClient/1.0',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'token': apiKey,
        ...(data ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode !== 502 && res.statusCode !== 503 && res.statusCode !== 404) {
          console.log(`FOUND! [${method}] ${path} => Status: ${res.statusCode}`);
          console.log(`   Headers:`, res.headers);
          console.log(`   Body:`, body.substring(0, 300));
        } else {
          console.log(`[${res.statusCode}] ${method} ${path}`);
        }
        resolve();
      });
    });

    req.on('error', err => {
      console.log(`[ERR] ${method} ${path}:`, err.message);
      resolve();
    });

    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log("=== Probing api.feexpay.me GET ===");
  for (const p of testPaths) {
    await probe(p, 'GET');
  }
  console.log("\n=== Probing api.feexpay.me POST ===");
  for (const p of testPaths) {
    await probe(p, 'POST');
  }
}

main();
