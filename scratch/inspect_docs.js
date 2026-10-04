async function inspectDocs() {
  const res = await fetch('https://docs.feexpay.me/');
  const html = await res.text();
  console.log('HTML docs length:', html.length);

  const regex = /src=["']([^"']+)["']/g;
  let match;
  const scripts = [];
  while ((match = regex.exec(html)) !== null) {
    if (match[1].endsWith('.js') || match[1].includes('.js')) scripts.push(match[1]);
  }
  console.log('Docs scripts:', scripts);

  for (const src of scripts) {
    const fullUrl = src.startsWith('http') ? src : 'https://docs.feexpay.me' + (src.startsWith('/') ? '' : '/') + src;
    try {
      const jsRes = await fetch(fullUrl);
      const jsText = await jsRes.text();
      console.log('\nDocs script:', src, 'length:', jsText.length);

      // Search for http/https URLs, API paths, curl snippets, post URLs
      const urls = jsText.match(/https?:\/\/[^\s"'`<>]+/g) || [];
      console.log('URLs in docs:', [...new Set(urls)].filter(u => !u.includes('w3.org') && !u.includes('react')));

      const apiPaths = jsText.match(/["']\/[a-zA-Z0-9_\-\/]+["']/g) || [];
      const interestingPaths = apiPaths.filter(p => p.includes('api') || p.includes('v1') || p.includes('pay') || p.includes('request') || p.includes('shop') || p.includes('order'));
      console.log('Paths in docs:', [...new Set(interestingPaths)].slice(0, 30));

      // Also search for JSON keys or parameters like "token", "shop", "amount", "callback_url", "mode"
      const snippets = jsText.match(/https?:\/\/api\.feexpay\.me[^\s"'`<>]+/g) || [];
      console.log('api.feexpay.me links:', [...new Set(snippets)]);

    } catch(e) {
      console.log('Err:', e.message);
    }
  }
}

inspectDocs();
