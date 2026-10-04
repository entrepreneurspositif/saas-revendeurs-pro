const https = require('https');

async function testEndpoint(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[${method}] ${url} => Status: ${res.statusCode}`);
        console.log(`Body:`, body.substring(0, 300));
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', err => {
      console.error(`[${method}] ${url} Error:`, err.message);
      resolve({ error: err.message });
    });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
  const shopId = "673db7093c2872d9f60742de";

  console.log("=== Testing FeexPay Endpoints ===");
  await testEndpoint("https://api.feexpay.me/v1/shops/" + shopId, 'GET', null, { 'Authorization': `Bearer ${apiKey}` });
  await testEndpoint("https://api.feexpay.me/v1/shop/" + shopId, 'GET', null, { 'Authorization': `Bearer ${apiKey}` });
  await testEndpoint(`https://api.feexpay.me/v1/merchant/requesttopay/single`, 'POST', {
    token: apiKey,
    shop: shopId,
    amount: 1000,
    phoneNumber: "22997000000",
    mode: "MTN",
    custom_id: "test123"
  });
  await testEndpoint(`https://api.feexpay.me/v1/merchant/requesttopay`, 'POST', {
    token: apiKey,
    shop: shopId,
    amount: 1000,
    custom_id: "test123"
  });
  await testEndpoint(`https://api.feexpay.me/v1/shop/${shopId}/pay`, 'POST', {
    amount: 1000,
    callback_url: "https://revente-abonnement.vercel.app/api/feexpay/callback",
    custom_id: "test123"
  }, { 'Authorization': `Bearer ${apiKey}` });

  // Test redirect checkout URLs
  await testEndpoint(`https://feexpay.me/pay?id=${shopId}&token=${apiKey}&amount=1000`, 'GET');
  await testEndpoint(`https://feexpay.me/checkout?id=${shopId}&token=${apiKey}&amount=1000`, 'GET');
  await testEndpoint(`https://feexpay.me/payment?id=${shopId}&token=${apiKey}&amount=1000`, 'GET');
  await testEndpoint(`https://app.feexpay.me/pay?id=${shopId}&token=${apiKey}&amount=1000`, 'GET');
  await testEndpoint(`https://app.feexpay.me/pay/${shopId}`, 'GET');
  await testEndpoint(`https://feexpay.me/pay/${shopId}`, 'GET');
  await testEndpoint(`https://api.feexpay.me/v1/pay/${shopId}`, 'GET');
}

main();
