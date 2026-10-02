import { findOrderByCodeOrId } from '../src/lib/orderHelper';

async function test() {
  const testInputs = [
    'TK-323631',
    '323631',
    'tk-323631',
    ' tk 323631 ',
    'TK 323631',
    'cmuq069j70001y0bkvptc6zrf'
  ];

  for (const input of testInputs) {
    const order = await findOrderByCodeOrId(input);
    console.log(`Input: "${input}" => Found:`, order ? `${order.ticketCode} (${order.productTitle})` : 'NOT FOUND');
  }
}

test().catch(console.error);
