const https = require('https');

function get(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', e => resolve(''));
  });
}

async function main() {
  const code = await get('https://checkout.feexpay.me/_next/static/chunks/02ql08tyujc0g.js');
  
  // Find all occurrences of orderId, ref, id, token, shop, etc. with 100 characters before and after
  const regex = /(.{0,100}(?:orderId|order_id|shopId|token|custom_id|amount|ref).{0,100})/gi;
  let match;
  while ((match = regex.exec(code)) !== null) {
    console.log('--- Match ---');
    console.log(match[1]);
  }
}

main();
