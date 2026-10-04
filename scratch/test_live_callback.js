async function testLiveCallback() {
  const url = 'https://revente-abonnement.vercel.app/api/feexpay/callback';
  console.log('Testing GET:', url);

  const resGet = await fetch(url, { redirect: 'manual' });
  console.log('GET Status:', resGet.status);
  console.log('GET Location header:', resGet.headers.get('location'));
  const textGet = await resGet.text();
  console.log('GET Response text snippet:', textGet.slice(0, 300));

  console.log('\nTesting POST:', url);
  const resPost = await fetch(url, { method: 'POST', redirect: 'manual' });
  console.log('POST Status:', resPost.status);
  console.log('POST Location header:', resPost.headers.get('location'));
  const textPost = await resPost.text();
  console.log('POST Response text snippet:', textPost.slice(0, 300));
}

testLiveCallback();
