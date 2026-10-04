const dns = require('dns');
const https = require('https');

const subdomains = [
  'api.feexpay.me',
  'app.feexpay.me',
  'pay.feexpay.me',
  'gateway.feexpay.me',
  'checkout.feexpay.me',
  'merchant.feexpay.me',
  'docs.feexpay.me',
  'feexpay.me'
];

async function checkSubdomain(sub) {
  return new Promise((resolve) => {
    dns.lookup(sub, (err, address) => {
      if (err) {
        console.log(`[DNS FAIL] ${sub}: ${err.message}`);
        return resolve();
      }
      console.log(`[DNS OK] ${sub} => ${address}`);
      
      const req = https.get(`https://${sub}/`, (res) => {
        console.log(`   [HTTP] https://${sub}/ => ${res.statusCode}`);
        if (res.headers.location) console.log(`   Location: ${res.headers.location}`);
        resolve();
      });
      req.on('error', (e) => {
        console.log(`   [HTTP ERR] https://${sub}/ => ${e.message}`);
        resolve();
      });
      req.setTimeout(5000, () => {
        req.destroy();
        console.log(`   [TIMEOUT] https://${sub}/`);
        resolve();
      });
    });
  });
}

async function main() {
  for (const sub of subdomains) {
    await checkSubdomain(sub);
  }
}

main();
