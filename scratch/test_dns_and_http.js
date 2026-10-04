const dns = require('dns');

async function testDnsAndHttp() {
  dns.lookup('api.feexpay.me', { all: true }, (err, addresses) => {
    console.log('DNS api.feexpay.me:', err || addresses);
  });

  dns.lookup('feexpay.me', { all: true }, (err, addresses) => {
    console.log('DNS feexpay.me:', err || addresses);
  });

  dns.lookup('checkout.feexpay.me', { all: true }, (err, addresses) => {
    console.log('DNS checkout.feexpay.me:', err || addresses);
  });

  // Test HTTP vs HTTPS on api.feexpay.me
  try {
    const resHttp = await fetch('http://api.feexpay.me/v1/request/payment', { method: 'POST' });
    console.log('HTTP api.feexpay.me status:', resHttp.status);
  } catch(e) {
    console.log('HTTP api.feexpay.me err:', e.message);
  }
}

testDnsAndHttp();
