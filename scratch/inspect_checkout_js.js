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
  const html = await get('https://checkout.feexpay.me/checkout/card-details');
  const scriptMatches = html.match(/src="(\/_next\/static\/chunks\/[^"]+)"/g) || [];
  console.log('Found scripts:', scriptMatches);

  for (const m of scriptMatches) {
    const src = m.replace('src="', '').replace('"', '');
    const url = 'https://checkout.feexpay.me' + src;
    console.log('\n--- Fetching:', url);
    const code = await get(url);

    // Search for searchParams, query params, 'missingOrderId', 'id', 'token', 'order'
    const paramMatches = code.match(/([a-zA-Z0-9_]+)\s*:\s*["']?[a-zA-Z0-9_]*["']?\s*,?\s*get\s*\(/g) || [];
    const getParamCalls = code.match(/\.get\(["']([a-zA-Z0-9_]+)["']\)/g) || [];
    const searchParamCalls = code.match(/searchParams\.get\(["']([a-zA-Z0-9_]+)["']\)/g) || [];
    const queryParamCalls = code.match(/query\.([a-zA-Z0-9_]+)/g) || [];

    console.log('get() params:', getParamCalls);
    console.log('searchParams.get() params:', searchParamCalls);
    console.log('query. params:', queryParamCalls);

    // Search for string literals in the code related to order / merchant / id / token
    const orderStrings = code.match(/["']([a-zA-Z0-9_-]*(?:order|id|token|shop|custom|amount|trans)[a-zA-Z0-9_-]*)["']/gi) || [];
    const uniqueStrings = [...new Set(orderStrings)].slice(0, 40);
    console.log('Relevant string tokens:', uniqueStrings);
  }
}

main();
