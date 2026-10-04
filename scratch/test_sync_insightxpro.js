const { createClient } = require('@libsql/client');

const url = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

const client = createClient({ url, authToken });

async function syncInsightXProDirectly() {
  console.log('Fetching Insightxpro supplier...');
  const suppRes = await client.execute("SELECT * FROM Supplier WHERE name LIKE '%Insight%' OR apiUrl LIKE '%insight%'");
  if (suppRes.rows.length === 0) {
    console.error('Insightxpro supplier not found in DB!');
    return;
  }
  const supplier = suppRes.rows[0];
  console.log('Supplier found:', supplier.id, supplier.name, supplier.apiUrl);

  const fetch = require('node-fetch');
  const prodRes = await fetch(`${supplier.apiUrl}/api/v1/products`, {
    headers: { 'X-API-Key': supplier.apiKey, 'Content-Type': 'application/json' }
  });
  const data = await prodRes.json();
  const products = data.products || [];
  console.log(`Fetched ${products.length} products from InsightXPro API.`);

  let synced = 0;
  for (const item of products) {
    const extId = String(item.id);
    const suppProdId = `sp_${supplier.id}_${extId}`;
    const name = item.name || 'Produit';
    const description = item.description_text || item.description || '';
    const costPrice = Number(item.price_usdt ?? item.price ?? 0);
    const stock = item.unlimited ? 999999 : Number(item.stock ?? 0);
    const emoji = item.emoji || null;
    const isAvailable = item.available !== false && stock > 0 ? 1 : 0;
    const now = new Date().toISOString();

    // Check if SupplierProduct exists
    const existingSP = await client.execute({
      sql: "SELECT id FROM SupplierProduct WHERE supplierId = ? AND externalId = ?",
      args: [supplier.id, extId]
    });

    let finalSuppProdId = suppProdId;
    if (existingSP.rows.length > 0) {
      finalSuppProdId = String(existingSP.rows[0].id);
      await client.execute({
        sql: `UPDATE SupplierProduct SET name=?, description=?, costPrice=?, stock=?, emoji=?, isAvailable=?, lastSyncedAt=? WHERE id=?`,
        args: [name, description, costPrice, stock, emoji, isAvailable, now, finalSuppProdId]
      });
    } else {
      await client.execute({
        sql: `INSERT INTO SupplierProduct (id, supplierId, externalId, name, description, costPrice, currency, stock, sold, productType, emoji, isAvailable, lastSyncedAt)
              VALUES (?, ?, ?, ?, ?, ?, 'USD', ?, 0, 'account', ?, ?, ?)`,
        args: [finalSuppProdId, supplier.id, extId, name, description, costPrice, stock, emoji, isAvailable, now]
      });
    }

    // Master product slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + extId.slice(-4);
    const sellingPrice = Number((costPrice * 1.75).toFixed(2));
    const cat = name.toLowerCase().includes('api') ? 'IA & APIs' : 'Abonnements & Comptes';

    const existingMaster = await client.execute({
      sql: "SELECT id FROM Product WHERE slug = ?",
      args: [slug]
    });

    if (existingMaster.rows.length > 0) {
      await client.execute({
        sql: `UPDATE Product SET title=?, sellingPrice=?, activeSupplierId=?, activeSupplierProductId=?, updatedAt=? WHERE id=?`,
        args: [name, sellingPrice, supplier.id, finalSuppProdId, now, String(existingMaster.rows[0].id)]
      });
    } else {
      await client.execute({
        sql: `INSERT INTO Product (id, title, slug, description, category, sellingPrice, currency, isActive, activeSupplierId, activeSupplierProductId, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, 'USD', 1, ?, ?, ?, ?)`,
        args: [`prod_ins_${extId}`, name, slug, description, cat, sellingPrice, supplier.id, finalSuppProdId, now, now]
      });
    }

    synced++;
  }

  console.log(`Successfully synced ${synced} products to Turso DB!`);
}

syncInsightXProDirectly().catch(console.error);
