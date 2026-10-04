const fs = require('fs');

async function extractIntegrationDocs() {
  const res = await fetch('https://docs.feexpay.me/assets/index-CtnoOYzq.js');
  const jsText = await res.text();
  
  // Extract snippet around pos 1015000 to 1035000
  const snippet = jsText.substring(1015000, 1035000);
  console.log('Snippet length:', snippet.length);
  fs.writeFileSync('d:\\Digital produit\\Web\\scratch\\docs_snippet.txt', snippet);
  console.log('Saved snippet to scratch\\docs_snippet.txt');
}

extractIntegrationDocs();
