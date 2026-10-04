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
  const code = await get('https://checkout.feexpay.me/_next/static/chunks/2v-15au_79q7u.js');
  
  // Find isSafeId definition
  const idx = code.indexOf('isSafeId');
  if (idx !== -1) {
    console.log('Found isSafeId:');
    console.log(code.substring(idx - 100, idx + 300));
  } else {
    console.log('isSafeId not found in 2v-15au_79q7u.js');
    // search in all chunks
  }
}

main();
