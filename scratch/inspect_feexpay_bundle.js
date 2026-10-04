const https = require('https');

function get(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function main() {
  const htmlRes = await get('https://docs.feexpay.me/');
  console.log('Docs HTML:', htmlRes.body);

  // Match all script src or asset paths in HTML
  const matches = htmlRes.body.match(/src="([^"]+)"/g) || [];
  console.log('Script matches:', matches);

  for (const m of matches) {
    const src = m.replace('src="', '').replace('"', '');
    const assetUrl = new URL(src, 'https://docs.feexpay.me/').href;
    console.log('Fetching asset:', assetUrl);
    const assetRes = await get(assetUrl);
    
    // Search for API endpoints, URLs, 'requesttopay', 'pay', 'checkout', 'api' in the bundle
    const endpoints = assetRes.body.match(/https?:\/\/[a-zA-Z0-9\.\-\/_\?=&]+/g) || [];
    console.log(`Found ${endpoints.length} URLs in ${src}`);
    
    const feexpayUrls = endpoints.filter(u => u.includes('feexpay'));
    console.log('FeexPay URLs found:', [...new Set(feexpayUrls)]);

    // Search for code keywords
    const keywords = assetRes.body.match(/(\/api\/[a-zA-Z0-9\/_-]+|\/v1\/[a-zA-Z0-9\/_-]+|requesttopay|callback_url|custom_id|init|shop)/gi) || [];
    console.log('Keyword matches:', [...new Set(keywords)].slice(0, 30));
  }
}

main();
