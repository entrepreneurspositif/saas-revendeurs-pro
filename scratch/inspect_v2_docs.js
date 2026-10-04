const fs = require('fs');

async function extractV2Docs() {
  const res = await fetch('https://docs.feexpay.me/assets/index-CtnoOYzq.js');
  const jsText = await res.text();
  console.log('JS text loaded, length:', jsText.length);

  // Search for api-v2.feexpay.me or api.feexpay.me
  let pos = 0;
  let matches = 0;
  while ((pos = jsText.indexOf('feexpay.me', pos)) !== -1) {
    matches++;
    console.log(`\n--- Match ${matches} at pos ${pos} ---`);
    console.log(jsText.substring(Math.max(0, pos - 150), Math.min(jsText.length, pos + 300)));
    pos += 10;
  }

  // Also search for curl or http request examples in text
  pos = 0;
  while ((pos = jsText.indexOf('curl', pos)) !== -1) {
    console.log(`\n--- Curl match at pos ${pos} ---`);
    console.log(jsText.substring(Math.max(0, pos - 50), Math.min(jsText.length, pos + 350)));
    pos += 4;
  }
}

extractV2Docs();
