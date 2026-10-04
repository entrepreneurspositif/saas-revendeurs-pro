const https = require('https');

const apiKey = "fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW";
const shopId = "673db7093c2872d9f60742de";
const ticket = "TK-392537";

const paramVariants = [
  { name: 'standard_custom_id', params: `id=${shopId}&token=${apiKey}&amount=1000&custom_id=${ticket}` },
  { name: 'with_order_id', params: `id=${shopId}&token=${apiKey}&amount=1000&order_id=${ticket}` },
  { name: 'with_both', params: `id=${shopId}&token=${apiKey}&amount=1000&custom_id=${ticket}&order_id=${ticket}` },
  { name: 'with_shop_token_orderid', params: `shop=${shopId}&token=${apiKey}&amount=1000&order_id=${ticket}` },
  { name: 'with_shop_id_and_order_id', params: `shop_id=${shopId}&token=${apiKey}&amount=1000&order_id=${ticket}` },
  { name: 'with_trans_id', params: `id=${shopId}&token=${apiKey}&amount=1000&trans_id=${ticket}` },
  { name: 'with_reference', params: `id=${shopId}&token=${apiKey}&amount=1000&reference=${ticket}` },
  { name: 'with_custom', params: `id=${shopId}&token=${apiKey}&amount=1000&custom=${ticket}` },
];

async function testParam(v) {
  const url = `https://checkout.feexpay.me/?${v.params}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`=== Variant: ${v.name} ===`);
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        if (res.headers.location) console.log(`Redirect: ${res.headers.location}`);
        
        // Search for error messages or text in page HTML
        const hasMissingOrder = d.includes("commande manquante") || d.includes("commande");
        const titleMatch = d.match(/<title>([^<]+)<\/title>/i);
        console.log(`Title:`, titleMatch ? titleMatch[1] : 'No title');
        console.log(`Contains 'commande':`, hasMissingOrder);
        console.log(`Body snippet: ${d.substring(0, 300)}\n`);
        resolve();
      });
    }).on('error', e => resolve());
  });
}

async function main() {
  for (const v of paramVariants) {
    await testParam(v);
  }
}

main();
