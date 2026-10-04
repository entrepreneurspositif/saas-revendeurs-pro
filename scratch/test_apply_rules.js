const { createClient } = require('@libsql/client');

const url = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

const client = createClient({ url, authToken });

const DEFAULT_RULES = [
  { id: 'rule_1', minPrice: 0, maxPrice: 5, marginPercent: 75 },
  { id: 'rule_2', minPrice: 5.01, maxPrice: 20, marginPercent: 50 },
  { id: 'rule_3', minPrice: 20.01, maxPrice: 50, marginPercent: 40 },
  { id: 'rule_4', minPrice: 50.01, maxPrice: 100, marginPercent: 30 },
  { id: 'rule_5', minPrice: 100.01, maxPrice: 999999, marginPercent: 20 },
];

async function applyPricingRules() {
  console.log('Saving default pricing rules to DB...');
  await client.execute({
    sql: `INSERT INTO Setting (key, value) VALUES ('pricing_margin_rules', ?)
          ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    args: [JSON.stringify(DEFAULT_RULES)]
  });

  console.log('Fetching all products and supplier products...');
  const prods = await client.execute("SELECT p.id, p.sellingPrice, p.activeSupplierProductId, sp.costPrice FROM Product p LEFT JOIN SupplierProduct sp ON p.activeSupplierProductId = sp.id");

  console.log(`Evaluating ${prods.rows.length} products...`);
  let updated = 0;

  for (const row of prods.rows) {
    const rawCost = Number(row.costPrice ?? (row.sellingPrice > 0 ? row.sellingPrice / 1.75 : 0));
    const cost = isNaN(rawCost) || rawCost <= 0 ? 0 : rawCost;

    if (cost > 0) {
      const matched = DEFAULT_RULES.find(r => cost >= r.minPrice && cost <= r.maxPrice);
      const percent = matched ? matched.marginPercent : 75;
      const calcSelling = Number((cost * (1 + percent / 100)).toFixed(2));

      if (calcSelling !== Number(row.sellingPrice)) {
        await client.execute({
          sql: "UPDATE Product SET sellingPrice = ? WHERE id = ?",
          args: [calcSelling, row.id]
        });
        updated++;
      }
    }
  }

  console.log(`Updated pricing for ${updated} products based on cost price ranges!`);
}

applyPricingRules().catch(console.error);
