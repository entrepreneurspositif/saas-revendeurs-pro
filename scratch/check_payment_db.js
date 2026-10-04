const { createClient } = require('@libsql/client');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
  }
});

const client = createClient({
  url: envVars.TURSO_DATABASE_URL || 'libsql://reseller-db-fatjo05.turso.io',
  authToken: envVars.TURSO_AUTH_TOKEN
});

async function main() {
  const res = await client.execute("SELECT * FROM Setting WHERE key LIKE '%feexpay%' OR key LIKE '%manual%' OR key LIKE '%custom%'");
  console.log('Payment Settings in DB:', res.rows);
}

main().catch(console.error);
