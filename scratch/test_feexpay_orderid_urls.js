const https = require('https');

const shopId = "673db7093c2872d9f60742de";
const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const ticketCode = "TK-392537";
const callbackUrl = encodeURIComponent("https://revente-abonnement.vercel.app/api/feexpay/callback");

const testUrl1 = `https://checkout.feexpay.me/?orderId=${ticketCode}&ref=${ticketCode}&id=${shopId}&token=${apiKey}&amount=14625&callback_url=${callbackUrl}`;
const testUrl2 = `https://checkout.feexpay.me/checkout/card-details?orderId=${ticketCode}&ref=${ticketCode}&id=${shopId}&token=${apiKey}&amount=14625&callback_url=${callbackUrl}`;

async function test(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.statusCode}`);
      if (res.headers.location) console.log(`Location: ${res.headers.location}`);
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`Body includes missingOrderId:`, d.includes('missingOrderId') || d.includes('ID de commande manquant'));
        console.log(`Body includes invalidOrderId:`, d.includes('invalidOrderId') || d.includes('ID de commande invalide'));
        console.log(`Body preview:`, d.substring(0, 300));
        console.log('\n');
        resolve();
      });
    });
  });
}

async function main() {
  await test(testUrl1);
  await test(testUrl2);
}

main();
