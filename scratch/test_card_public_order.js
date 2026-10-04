async function testCardPublicOrder() {
  const shopId = '673db7093c2872d9f60742de';
  const apiKey = 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW';

  const testIds = ['TK-779565', shopId, '673db7093c2872d9f60742de', 'test', '123'];

  for (const id of testIds) {
    const url = `https://checkout.feexpay.me/api/card/public/order/${encodeURIComponent(id)}`;
    try {
      const res = await fetch(url);
      console.log('GET', url, '-> Status:', res.status);
      const text = await res.text();
      console.log('Body:', text.slice(0, 300));
    } catch(e) {
      console.log('Err:', e.message);
    }
  }
}

testCardPublicOrder();
