const https = require('https');

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";

const endpoints = [
  '/v1/payments',
  '/v1/payment',
  '/v1/requesttopay',
  '/v1/merchant/requesttopay',
  '/v1/merchant/requesttopay/single',
  '/v1/transactions',
  '/v1/checkout',
  '/v1/shop/' + shopId + '/requesttopay',
  '/v1/shop/' + shopId + '/payment'
];

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const url = 'https://api.feexpay.me' + path;
    const data = JSON.stringify({
      token: apiKey,
      shop: shopId,
      amount: 1000,
      email: "test@example.com",
      custom_id: "TK-123456",
      callback_url: "https://revente-abonnement.vercel.app/api/feexpay/callback"
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'token': apiKey,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log(`[POST ${res.statusCode}] ${path}`);
        if (res.statusCode !== 502 && res.statusCode !== 404) {
          console.log(`   SUCCESS BODY: ${body}`);
        } else {
          console.log(`   Body preview: ${body.substring(0, 150)}`);
        }
        resolve();
      });
    });

    req.on('error', err => {
      console.log(`[ERR] ${path}: ${err.message}`);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
}

main();
