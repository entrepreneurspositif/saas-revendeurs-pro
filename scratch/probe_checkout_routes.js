const https = require('https');

const paths = [
  '/checkout/card-details',
  '/checkout/mobile-money',
  '/checkout/momo',
  '/checkout/pay',
  '/checkout/payment',
  '/checkout/choice',
  '/checkout/select',
  '/checkout/gateway',
  '/checkout/init',
  '/checkout',
  '/pay',
  '/payment',
  '/momo',
  '/mobile-money'
];

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";
const ticket = "TK-392537";

async function testPath(p) {
  const url = `https://checkout.feexpay.me${p}?id=${shopId}&token=${apiKey}&amount=1000&custom_id=${ticket}`;
  return new Promise(resolve => {
    https.get(url, res => {
      console.log(`[${res.statusCode}] ${p}`);
      if (res.headers.location) console.log(`   Location: ${res.headers.location}`);
      resolve();
    }).on('error', e => resolve());
  });
}

async function main() {
  for (const p of paths) {
    await testPath(p);
  }
}

main();
