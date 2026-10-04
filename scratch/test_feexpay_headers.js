const https = require('https');

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";

async function test(url, method = 'GET', bodyObj = null) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const dataStr = bodyObj ? JSON.stringify(bodyObj) : null;
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`[${method}] ${url} => ${res.statusCode}`);
        if (res.headers.location) console.log(`   Redirect: ${res.headers.location}`);
        console.log(`   Body: ${data.substring(0, 250)}\n`);
        resolve();
      });
    });
    req.on('error', e => {
      console.log(`[${method}] ${url} Error: ${e.message}\n`);
      resolve();
    });
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function main() {
  console.log("=== Testing API Endpoints with Headers ===");
  await test("https://api.feexpay.me/api/v1/shop/" + shopId);
  await test("https://api.feexpay.me/v1/shop/" + shopId);
  await test("https://api.feexpay.me/api/shop/" + shopId);
  await test("https://api.feexpay.me/v1/merchant/requesttopay/single", "POST", {
    token: apiKey,
    shop: shopId,
    amount: 1000,
    phoneNumber: "22997000000",
    mode: "MTN",
    custom_id: "test1"
  });
  await test("https://feexpay.me/api/v1/merchant/requesttopay/single", "POST", {
    token: apiKey,
    shop: shopId,
    amount: 1000,
    phoneNumber: "22997000000",
    mode: "MTN",
    custom_id: "test1"
  });
  await test(`https://feexpay.me/pay/?id=${shopId}&token=${apiKey}&amount=1000`);
  await test(`https://feexpay.me/pay/index.html?id=${shopId}&token=${apiKey}&amount=1000`);
  await test(`https://feexpay.me/pay?id=${shopId}&token=${apiKey}&amount=1000`);
}

main();
