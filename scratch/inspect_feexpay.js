const fs = require('fs');

async function inspectCheckout() {
  try {
    const res = await fetch('https://checkout.feexpay.me/checkout/card-details');
    const html = await res.text();
    console.log('HTML length:', html.length);
    
    // Regex for script src
    const regex = /src=["']([^"']+)["']/g;
    let match;
    const scripts = [];
    while ((match = regex.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    console.log('Scripts:', scripts);

    for (const src of scripts) {
      const fullUrl = src.startsWith('http') ? src : 'https://checkout.feexpay.me' + (src.startsWith('/') ? '' : '/') + src;
      console.log('\nFetching JS script:', fullUrl);
      try {
        const jsRes = await fetch(fullUrl);
        const jsText = await jsRes.text();
        console.log('Script length:', jsText.length);
        
        // Search for API endpoints, URLs, or backend paths
        const urls = jsText.match(/https?:\/\/[^\s"'`<>]+/g) || [];
        const uniqueUrls = [...new Set(urls)];
        console.log('URLs found in script:', uniqueUrls);

        // Search for keywords like "order", "ref", "shop", "card-details", "api", "init", "create"
        const apiCalls = jsText.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
        console.log('API routes found:', [...new Set(apiCalls)]);
        
        const v1Calls = jsText.match(/\/v1\/[a-zA-Z0-9_\-\/]+/g) || [];
        console.log('v1 routes found:', [...new Set(v1Calls)]);

      } catch(e) {
        console.log('Err fetching script:', e.message);
      }
    }
  } catch (err) {
    console.error('Err:', err);
  }
}

inspectCheckout();
