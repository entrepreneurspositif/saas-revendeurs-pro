async function inspectFeexPayMeRoutes() {
  const res = await fetch('https://feexpay.me/');
  const html = await res.text();
  console.log('HTML length:', html.length);
  
  const regex = /src=["']([^"']+)["']/g;
  let match;
  const scripts = [];
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  console.log('Scripts on feexpay.me:', scripts);

  for (const src of scripts) {
    const fullUrl = src.startsWith('http') ? src : 'https://feexpay.me' + (src.startsWith('/') ? '' : '/') + src;
    try {
      const jsRes = await fetch(fullUrl);
      const jsText = await jsRes.text();
      console.log('\nScript:', fullUrl, 'length:', jsText.length);
      
      // Look for routes or paths in Next.js bundle
      const pageMatches = jsText.match(/page:["']([^"']+)["']/g) || [];
      console.log('Page matches:', [...new Set(pageMatches)]);

      const pathMatches = jsText.match(/["']\/(?:[a-zA-Z0-9_\-\/]+)["']/g) || [];
      const feexPaths = pathMatches.filter(p => p.includes('pay') || p.includes('checkout') || p.includes('api') || p.includes('shop'));
      console.log('Interesting paths:', [...new Set(feexPaths)].slice(0, 30));
    } catch(e) {
      console.log('Err:', e.message);
    }
  }
}

inspectFeexPayMeRoutes();
