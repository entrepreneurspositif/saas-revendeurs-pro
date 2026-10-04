const { createClient } = require('@libsql/client');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  console.log("Connecting directly to Turso via @libsql/client...");
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });

  // Test selecting settings table
  const res = await turso.execute("SELECT * FROM Setting;");
  console.log("Settings rows in Turso:", res.rows);

  const suppliers = await turso.execute("SELECT * FROM Supplier;");
  console.log("Suppliers rows in Turso:", suppliers.rows);
}

main().catch(err => console.error("Turso error:", err));
