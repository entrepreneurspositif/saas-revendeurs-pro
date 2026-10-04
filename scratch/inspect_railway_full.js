const fetch = require('node-fetch');

async function inspectRailwayFull() {
  const baseUrl = 'https://open-greeting-glow-production.up.railway.app/api/public/reseller/v1';
  const apiKey = 'rsk_live_d2bc21140eb669b732da8678c494b9ccbfa1e1502b113492';

  const res = await fetch(`${baseUrl}/products`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  console.log('Total products count:', data.products ? data.products.length : 'none');
  console.log('Sample product 0:', JSON.stringify(data.products[0], null, 2));
  if (data.products.length > 1) {
    console.log('Sample product 1:', JSON.stringify(data.products[1], null, 2));
  }
}

inspectRailwayFull();
