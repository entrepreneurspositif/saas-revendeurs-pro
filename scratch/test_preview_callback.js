async function testPreviewCallback() {
  const url = 'https://revente-abonnement-4yjsqfgo2-entrepreneurs-positif.vercel.app/api/feexpay/callback';
  console.log('Testing GET on preview URL:', url);

  const resGet = await fetch(url, { redirect: 'manual' });
  console.log('GET Status:', resGet.status);
  console.log('GET Location header:', resGet.headers.get('location'));
  const textGet = await resGet.text();
  console.log('GET Response snippet:', textGet.slice(0, 300));
}

testPreviewCallback();
