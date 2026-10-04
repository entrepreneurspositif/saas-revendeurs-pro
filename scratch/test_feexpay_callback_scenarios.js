const sampleFeexPayPayloads = [
  // Scenario 1: GET redirect with searchParams
  { type: 'GET searchParams', url: 'https://revente-abonnement.vercel.app/api/feexpay/callback?custom_id=TK-392537&status=SUCCESSFUL' },
  { type: 'GET searchParams alternate', url: 'https://revente-abonnement.vercel.app/api/feexpay/callback?custom_info=TK-392537&transaction_status=SUCCESS' },
  { type: 'GET searchParams ref only', url: 'https://revente-abonnement.vercel.app/api/feexpay/callback?ref=AKXrnX00&status=SUCCESSFUL' },
  { type: 'GET searchParams description', url: 'https://revente-abonnement.vercel.app/api/feexpay/callback?description=Achat+Netflix+TK-392537' },
  
  // Scenario 2: POST JSON body
  { type: 'POST JSON custom_id', body: { custom_id: 'TK-392537', status: 'SUCCESSFUL' } },
  { type: 'POST JSON custom_info', body: { custom_info: 'TK-392537', status: 'SUCCESSFUL' } },
  { type: 'POST JSON ref only', body: { ref: 'AKXrnX00', status: 'SUCCESSFUL', description: 'Achat TK-392537' } },
  
  // Scenario 3: POST FormData / URL-encoded form (Browser POST form submit!)
  { type: 'POST FormData', form: { custom_id: 'TK-392537', status: 'SUCCESSFUL' } }
];

console.log('Testing payload formats...');
sampleFeexPayPayloads.forEach(p => console.log('Parsed:', p.type));
