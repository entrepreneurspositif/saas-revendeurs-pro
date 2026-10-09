const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_DATABASE_URL || "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_TOKEN) {
  console.error("TURSO_AUTH_TOKEN environment variable is required.");
  process.exit(1);
}

const client = createClient({
  url: TURSO_URL.replace('libsql://', 'https://'),
  authToken: TURSO_TOKEN,
});

async function main() {
  console.log('Connecting to Turso...');
  
  const alterStatements = [
    "ALTER TABLE Tenant ADD COLUMN feexpayApiKey TEXT",
    "ALTER TABLE Tenant ADD COLUMN feexpayShopId TEXT",
    "ALTER TABLE Tenant ADD COLUMN feexpayEnabled BOOLEAN DEFAULT 0",
    "ALTER TABLE Tenant ADD COLUMN monerooSecretKey TEXT",
    "ALTER TABLE Tenant ADD COLUMN monerooEnabled BOOLEAN DEFAULT 0",
    "ALTER TABLE Tenant ADD COLUMN customGatewayEnabled BOOLEAN DEFAULT 0",
  ];

  for (const sql of alterStatements) {
    try {
      console.log('Executing:', sql);
      await client.execute(sql);
      console.log('Success!');
    } catch (e) {
      console.log('Notice / Error (already exists?):', e.message);
    }
  }

  console.log('Migration finished!');
}

main().catch(console.error);
