const { createClient } = require('@libsql/client');

const url = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

const client = createClient({ url, authToken });

async function check() {
  const res = await client.execute("SELECT * FROM Setting WHERE key LIKE 'feexpay%'");
  console.log("FeexPay Settings in DB:", res.rows);

  // Set default values if missing
  const keys = [
    { key: 'feexpay_api_key', value: 'fp_yK5LTDuJYFkx3t6ElDkrC1wfC9ZIgOJ6ua3rCNj8pktir1oBExlVDRkQvOGidNZW' },
    { key: 'feexpay_shop_id', value: '673db7093c2872d9f60742de' },
    { key: 'feexpay_enabled', value: 'true' }
  ];

  for (const k of keys) {
    await client.execute({
      sql: "INSERT INTO Setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      args: [k.key, k.value]
    });
  }

  const res2 = await client.execute("SELECT * FROM Setting WHERE key LIKE 'feexpay%'");
  console.log("Updated FeexPay Settings in DB:", res2.rows);
}

check().catch(console.error);
