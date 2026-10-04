const fetch = require('node-fetch');

async function testRailwaySupplier() {
  const baseUrl = 'https://open-greeting-glow-production.up.railway.app';
  const apiPath = '/api/public/reseller/v1';
  const apiKey = 'rsk_live_d2bc21140eb669b732da8678c494b9ccbfa1e1502b113492';

  const endpointsToTry = [
    '/products',
    '/catalog',
    '/balance',
    '/profile',
    '/account',
    '/health',
    '/me',
    '/orders'
  ];

  const headerVariants = [
    { 'X-API-Key': apiKey },
    { 'Authorization': `Bearer ${apiKey}` },
    { 'x-reseller-key': apiKey },
    { 'x-api-key': apiKey }
  ];

  for (const ep of endpointsToTry) {
    for (let i = 0; i < headerVariants.length; i++) {
      const fullUrl = `${baseUrl}${apiPath}${ep}`;
      try {
        const res = await fetch(fullUrl, {
          headers: { ...headerVariants[i], 'Content-Type': 'application/json' }
        });
        console.log(`[${res.status}] GET ${fullUrl} (Header variant ${i})`);
        if (res.ok) {
          const text = await res.text();
          console.log(`Response text (${text.length} chars):`, text.slice(0, 500));
          break; // stop header variant loop if ok
        }
      } catch (err) {
        console.error(`Error GET ${fullUrl}:`, err.message);
      }
    }
  }
}

testRailwaySupplier();
