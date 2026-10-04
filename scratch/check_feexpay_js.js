const https = require('https');

const jsUrls = [
  'https://feexpay.me/feexpay.js',
  'https://checkout.feexpay.me/feexpay.js',
  'https://api.feexpay.me/feexpay.js',
  'https://checkout.feexpay.me/js/feexpay.js',
  'https://feexpay.me/js/feexpay.js',
  'https://checkout.feexpay.me/sdk.js',
  'https://feexpay.me/sdk.js'
];

async function checkJs(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      console.log(`[${res.statusCode}] ${url}`);
      if (res.statusCode === 200) {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          console.log(`   --> Content (${d.length} bytes): ${d.substring(0, 300)}`);
          resolve();
        });
      } else {
        resolve();
      }
    }).on('error', e => {
      console.log(`[ERR] ${url}: ${e.message}`);
      resolve();
    });
  });
}

async function main() {
  for (const u of jsUrls) {
    await checkJs(u);
  }
}

main();
