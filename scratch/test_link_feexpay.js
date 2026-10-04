async function testLink() {
  const url = 'https://link.feexpay.me/AKXrnX00/commande_tk-779565';
  console.log('Testing link:', url);
  const res = await fetch(url, { redirect: 'follow' });
  console.log('Status:', res.status);
  console.log('Final URL:', res.url);
  const text = await res.text();
  console.log('Page Title / Content snippet:', text.slice(0, 500));
}

testLink();
