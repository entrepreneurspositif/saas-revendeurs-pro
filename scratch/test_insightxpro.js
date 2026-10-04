const fetch = require('node-fetch');

async function testInsightXPro() {
  const apiKey = 'isk_live_Pl2kQINpUC3XZGM089HREphKJlFDEEWZ';
  const baseUrl = 'https://api.insightxpro.store';

  console.log('Testing GET /api/v1/balance...');
  try {
    const balRes = await fetch(`${baseUrl}/api/v1/balance`, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Balance status:', balRes.status);
    const balData = await balRes.json();
    console.log('Balance response:', JSON.stringify(balData, null, 2));
  } catch (err) {
    console.error('Balance error:', err);
  }

  console.log('\nTesting GET /api/v1/products...');
  try {
    const prodRes = await fetch(`${baseUrl}/api/v1/products`, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Products status:', prodRes.status);
    const prodData = await prodRes.json();
    console.log('Products response count:', prodData.products ? prodData.products.length : 'none');
    if (prodData.products && prodData.products.length > 0) {
      console.log('First 3 products:', JSON.stringify(prodData.products.slice(0, 3), null, 2));
    } else {
      console.log('Raw products payload:', JSON.stringify(prodData, null, 2));
    }
  } catch (err) {
    console.error('Products error:', err);
  }
}

testInsightXPro();
