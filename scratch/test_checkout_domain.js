const https = require('https');

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";

const urls = [
  `https://checkout.feexpay.me/?id=${shopId}&token=${apiKey}&amount=1000&custom_id=test1`,
  `https://checkout.feexpay.me/pay?id=${shopId}&token=${apiKey}&amount=1000&custom_id=test1`,
  `https://checkout.feexpay.me/checkout?id=${shopId}&token=${apiKey}&amount=1000&custom_id=test1`,
  `https://checkout.feexpay.me/payin?id=${shopId}&token=${apiKey}&amount=1000&custom_id=test1`,
  `https://checkout.feexpay.me/payment?id=${shopId}&token=${apiKey}&amount=1000&custom_id=test1`,
  `https://checkout.feexpay.me/${shopId}`,
  `https://checkout.feexpay.me/shop/${shopId}`,
  `https://checkout.feexpay.me/api/v1/requesttopay`,
  `https://checkout.feexpay.me/v1/requesttopay`
];

async function test(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.get(url, (res) => {
      console.log(`[GET] ${url}`);
      console.log(`  Status: ${res.statusCode}`);
      if (res.headers.location) console.log(`  Location: ${res.headers.location}`);
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode !== 404) console.log(`  Body preview: ${d.substring(0, 200)}`);
        console.log('');
        resolve();
      });
    });
    req.on('error', e => {
      console.log(`[ERR] ${url}: ${e.message}\n`);
      resolve();
    });
  });
}

async function main() {
  for (const u of urls) {
    await test(u);
  }
}

main();
