async function testProdInit() {
  const url = 'https://revente-abonnement.vercel.app/api/feexpay/init';
  console.log('Testing live Vercel endpoint:', url);

  // First create a test ticket or test code
  const ticketRes = await fetch('https://revente-abonnement.vercel.app/api/tickets/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productTitle: 'Test FeexPay',
      quantity: 1,
      totalAmount: 1,
      ticketCode: 'TK-FEEXPROD'
    })
  });
  console.log('Create ticket status:', ticketRes.status);
  const ticketData = await ticketRes.json().catch(() => ({}));
  console.log('Ticket data:', ticketData);

  const ticketCode = ticketData.ticketCode || 'TK-FEEXPROD';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketCode })
  });

  console.log('FeexPay Init Status:', res.status);
  const data = await res.json();
  console.log('FeexPay Init Response:', data);
}

testProdInit();
