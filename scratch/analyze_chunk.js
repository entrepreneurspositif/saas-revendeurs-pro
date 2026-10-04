const fs = require('fs');

async function analyzeChunk() {
  const res = await fetch('https://checkout.feexpay.me/_next/static/chunks/02ql08tyujc0g.js');
  const jsText = await res.text();
  
  // Find all matches for API calls or endpoints
  const apiMatches = jsText.match(/["']\/api\/[^"']+["']/g) || [];
  console.log('API endpoints:', [...new Set(apiMatches)]);

  // Let's search for fetch, axios, or endpoint constructions
  let pos = 0;
  while ((pos = jsText.indexOf('/api/', pos)) !== -1) {
    console.log('\n--- Match context at pos', pos, '---');
    console.log(jsText.substring(Math.max(0, pos - 100), Math.min(jsText.length, pos + 200)));
    pos += 5;
  }

  // Also search for orderId / ref / shopId
  pos = 0;
  while ((pos = jsText.indexOf('orderId', pos)) !== -1) {
    console.log('\n--- Match context for orderId at pos', pos, '---');
    console.log(jsText.substring(Math.max(0, pos - 50), Math.min(jsText.length, pos + 150)));
    pos += 7;
  }
}

analyzeChunk();
