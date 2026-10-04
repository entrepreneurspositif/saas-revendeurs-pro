const { createClient } = require('@libsql/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

const localDbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

async function migrate() {
  console.log("Starting full migration from local dev.db to Turso Cloud Database...");
  
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });
  const local = new sqlite3.Database(localDbPath);

  // Helper to query local db
  const allLocal = (sql) => new Promise((res, rej) => local.all(sql, [], (err, rows) => err ? rej(err) : res(rows)));

  // 1. Fetch all tables schema DDL from local SQLite sqlite_master
  const tables = await allLocal("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';");
  
  console.log(`Found ${tables.length} tables to create on Turso:`, tables.map(t => t.name));

  // Disable foreign keys temporarily for batch insert
  await turso.execute("PRAGMA foreign_keys = OFF;");

  for (const table of tables) {
    console.log(`\nProcessing table: ${table.name}...`);
    // Create table if not exists
    await turso.execute(table.sql);

    // Fetch local rows
    const rows = await allLocal(`SELECT * FROM "${table.name}"`);
    console.log(`  Read ${rows.length} rows from local table "${table.name}"`);

    if (rows.length > 0) {
      const cols = Object.keys(rows[0]);
      const placeholders = cols.map(() => '?').join(', ');
      const insertSql = `INSERT OR REPLACE INTO "${table.name}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;

      for (const row of rows) {
        const args = cols.map(c => row[c]);
        await turso.execute({ sql: insertSql, args });
      }
      console.log(`  ✅ Successfully migrated ${rows.length} rows to Turso "${table.name}"`);
    }
  }

  await turso.execute("PRAGMA foreign_keys = ON;");
  console.log("\n🎉 ALL TABLES AND DATA HAVE BEEN FULLY MIGRATED TO TURSO CLOUD DATABASE!");
  local.close();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
