const fs = require('fs');

async function parseAllCurls() {
  const res = await fetch('https://docs.feexpay.me/assets/index-CtnoOYzq.js');
  const text = await res.text();

  // Find all code blocks containing curl
  const matches = text.match(/curl\s+[^\`"']+/gi) || [];
  console.log(`Found ${matches.length} curl matches:`);
  
  matches.forEach((m, i) => {
    console.log(`\n--- Curl #${i + 1} ---`);
    console.log(m.substring(0, 400));
  });

  // Find all endpoints starting with /api/
  const endpoints = text.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
  console.log('\nAll API endpoints in docs bundle:', [...new Set(endpoints)]);
}

parseAllCurls();
