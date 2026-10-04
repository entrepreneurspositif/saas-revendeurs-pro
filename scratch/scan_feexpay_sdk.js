async function scanSdk() {
  const hosts = [
    'https://feexpay.me',
    'https://checkout.feexpay.me',
    'https://api.feexpay.me',
    'https://sdk.feexpay.me',
    'https://cdn.feexpay.me',
    'https://app.feexpay.me'
  ];

  const paths = [
    '/feexpay.js',
    '/sdk/feexpay.js',
    '/js/feexpay.js',
    '/sdk.js',
    '/v1/feexpay.js',
    '/dist/feexpay.js',
    '/widget.js',
    '/pay.js'
  ];

  for (const h of hosts) {
    for (const p of paths) {
      try {
        const url = h + p;
        const res = await fetch(url);
        if (res.status === 200) {
          const text = await res.text();
          console.log('FOUND SDK:', url, 'Length:', text.length, 'Snippet:', text.slice(0, 150));
        } else if (res.status !== 404 && res.status !== 502) {
          console.log('INTERESTING:', url, res.status);
        }
      } catch(e) {
        // ignore
      }
    }
  }
}

scanSdk();
