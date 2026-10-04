const { createClient } = require('@libsql/client');

const url = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

const client = createClient({ url, authToken });

async function syncHubxStoreDirectly() {
  console.log('Fetching Hubxstore supplier from DB...');
  const suppRes = await client.execute("SELECT * FROM Supplier WHERE name LIKE '%Hubx%' OR apiUrl LIKE '%railway%'");
  if (suppRes.rows.length === 0) {
    console.error('Hubxstore supplier not found in DB!');
    return;
  }
  const supplier = suppRes.rows[0];
  console.log('Supplier found:', supplier.id, supplier.name, supplier.apiUrl);

  const fetch = require('node-fetch');
  let cleanUrl = supplier.apiUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.includes('/api/public/reseller/v1')) {
    cleanUrl = `${cleanUrl}/api/public/reseller/v1`;
  }

  const prodRes = await fetch(`${cleanUrl}/products`, {
    headers: { 'Authorization': `Bearer ${supplier.apiKey}`, 'Content-Type': 'application/json' }
  });
  const data = await prodRes.json();
  const products = data.products || [];
  console.log(`Fetched ${products.length} products from Hubxstore API.`);

  let synced = 0;
  for (const item of products) {
    try {
      const extId = String(item.id || item.slug);
      const suppProdId = `sp_${supplier.id}_${extId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
      const name = String(item.name || 'Produit');
      const description = String(item.description || '');
      const rawCost = Number(item.price_usdt ?? item.price ?? 0);
      const costPrice = isNaN(rawCost) ? 0 : rawCost;
      const rawStock = Number(item.stock ?? 0);
      const stock = isNaN(rawStock) ? 0 : rawStock;
      const isAvailable = item.active !== false && stock > 0 ? 1 : 0;
      const now = new Date().toISOString();

      const existingSP = await client.execute({
        sql: "SELECT id FROM SupplierProduct WHERE supplierId = ? AND externalId = ?",
        args: [supplier.id, extId]
      });

      let finalSuppProdId = suppProdId;
      if (existingSP.rows.length > 0) {
        finalSuppProdId = String(existingSP.rows[0].id);
        await client.execute({
          sql: `UPDATE SupplierProduct SET name=?, description=?, costPrice=?, stock=?, isAvailable=?, lastSyncedAt=? WHERE id=?`,
          args: [name, description, costPrice, stock, isAvailable, now, finalSuppProdId]
        });
      } else {
        await client.execute({
          sql: `INSERT INTO SupplierProduct (id, supplierId, externalId, name, description, costPrice, currency, stock, sold, productType, isAvailable, lastSyncedAt)
                VALUES (?, ?, ?, ?, ?, ?, 'USD', ?, 0, 'account', ?, ?)`,
          args: [finalSuppProdId, supplier.id, extId, name, description, costPrice, stock, isAvailable, now]
        });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + extId.slice(-4);
      const calcPrice = costPrice > 0 ? costPrice * 1.75 : 10;
      const sellingPrice = Number((isNaN(calcPrice) ? 10 : calcPrice).toFixed(2));
      const cat = name.toLowerCase().includes('api') || name.toLowerCase().includes('bot') || name.toLowerCase().includes('cursor') ? 'IA & APIs' : 'Abonnements & Comptes';

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
          args: [`prod_hubx_${extId.replace(/[^a-zA-Z0-9_-]/g, '')}`, name, slug, description, cat, sellingPrice, supplier.id, finalSuppProdId, now, now]
        });
      }

      synced++;
    } catch (err) {
      console.error('Failed on item:', item, err.message);
    }
  }

  console.log(`Successfully synced ${synced} products from Hubxstore to Turso DB!`);
}

syncHubxStoreDirectly().catch(console.error);
