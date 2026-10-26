const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Parse .env manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
} catch (e) {
  console.log('No .env file read:', e.message);
}

async function main() {
  const url = (process.env.TURSO_DATABASE_URL || '').replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log('Connecting to Turso at:', url);
  const client = createClient({ url, authToken });

  // 1. Check existing columns in Tenant table
  const tableInfo = await client.execute("PRAGMA table_info('Tenant');");
  console.log('Current Tenant columns:');
  const existingColumns = tableInfo.rows.map(r => r.name);
  console.log(existingColumns.join(', '));

  // 2. Add productTemplate column if not present
  if (!existingColumns.includes('productTemplate')) {
    console.log('Adding productTemplate column to Tenant...');
    await client.execute("ALTER TABLE Tenant ADD COLUMN productTemplate TEXT DEFAULT 'grid-modern';");
    console.log('Successfully added productTemplate column!');
  } else {
    console.log('productTemplate column already exists.');
  }

  // Check if any other columns are missing
  const expectedColumns = [
    { name: 'themePreset', def: "TEXT DEFAULT 'cyber-dark'" },
    { name: 'fontFamily', def: "TEXT DEFAULT 'Inter'" },
    { name: 'buttonColor', def: "TEXT DEFAULT '#0284c7'" },
    { name: 'buttonTextColor', def: "TEXT DEFAULT '#ffffff'" },
    { name: 'buttonRadius', def: "TEXT DEFAULT 'rounded-xl'" },
    { name: 'bannerAnnouncement', def: "TEXT" },
    { name: 'resetToken', def: "TEXT" },
    { name: 'resetTokenExpiresAt', def: "DATETIME" },
    { name: 'emailVerified', def: "INTEGER DEFAULT 0" },
    { name: 'emailVerificationCode', def: "TEXT" },
    { name: 'emailVerificationExpiresAt', def: "DATETIME" },
    { name: 'emailVerifiedAt', def: "DATETIME" },
    { name: 'notifyEmailOnOrder', def: "INTEGER DEFAULT 1" },
    { name: 'notifyEmailOnOtp', def: "INTEGER DEFAULT 1" },
    { name: 'notifyEmailOnPayout', def: "INTEGER DEFAULT 1" },
  ];

  for (const col of expectedColumns) {
    if (!existingColumns.includes(col.name)) {
      console.log(`Adding missing column ${col.name} to Tenant...`);
      try {
        await client.execute(`ALTER TABLE Tenant ADD COLUMN ${col.name} ${col.def};`);
        console.log(`Successfully added ${col.name}!`);
      } catch (err) {
        console.error(`Error adding ${col.name}:`, err.message);
      }
    }
  }

  // 3. Ensure required Unique Indexes exist for Prisma upsert and queries
  try {
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "SupplierProduct_supplierId_externalId_key" ON "SupplierProduct"("supplierId", "externalId");`);
    console.log('Verified index: SupplierProduct_supplierId_externalId_key');
  } catch (err) {
    console.error('Error creating SupplierProduct index:', err.message);
  }

  try {
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");`);
    console.log('Verified index: Product_slug_key');
  } catch (err) {
    console.error('Error creating Product slug index:', err.message);
  }

  console.log('Migration check complete!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
