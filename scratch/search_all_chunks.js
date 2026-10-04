async function searchAllChunks() {
  const res = await fetch('https://checkout.feexpay.me/checkout/card-details');
  const html = await res.text();
  
  const regex = /src=["']([^"']+)["']/g;
  let match;
  const scripts = [];
  while ((match = regex.exec(html)) !== null) {
    if (match[1].endsWith('.js')) scripts.push(match[1]);
  }

  for (const src of scripts) {
    const fullUrl = src.startsWith('http') ? src : 'https://checkout.feexpay.me' + (src.startsWith('/') ? '' : '/') + src;
    try {
      const jsRes = await fetch(fullUrl);
      const jsText = await jsRes.text();
      
      const apiMatches = jsText.match(/["']\/api\/[a-zA-Z0-9_\-\/]+["']/g) || [];
      const fetchMatches = jsText.match(/fetch\(["'`][^"'`]+["'`]/g) || [];

      if (apiMatches.length > 0 || fetchMatches.length > 0) {
        console.log('\nScript:', src);
        console.log('API routes:', [...new Set(apiMatches)]);
        console.log('Fetches:', [...new Set(fetchMatches)].slice(0, 10));
      }
    } catch(e) {
      console.log('Err:', e.message);
    }
  }
}

searchAllChunks();
