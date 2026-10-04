async function testBrowserCallback() {
  const url = 'https://revente-abonnement.vercel.app/api/feexpay/callback';
  console.log('Testing GET with browser headers:', url);

  const resGet = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    },
    redirect: 'manual'
  });

  console.log('GET Status:', resGet.status);
  console.log('GET Location header:', resGet.headers.get('location'));
}

testBrowserCallback();
