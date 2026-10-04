const fetch = require('node-fetch');

async function testOrderStructure() {
  const baseUrl = 'https://open-greeting-glow-production.up.railway.app/api/public/reseller/v1';
  const apiKey = 'rsk_live_d2bc21140eb669b732da8678c494b9ccbfa1e1502b113492';

  try {
    const res = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: '00870fca-cc16-461e-baba-0dfcaeb73b74',
        quantity: 1,
        external_order_id: `test-ord-${Date.now()}`
      })
    });
    console.log('Order POST status:', res.status);
    const text = await res.text();
    console.log('Order POST response:', text);
  } catch (e) {
    console.error('Order test error:', e);
  }
}

testOrderStructure();
