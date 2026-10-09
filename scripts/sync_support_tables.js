const { createClient } = require('@libsql/client');

async function syncSupportTables() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || 'https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io';
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoToken) {
    console.error("TURSO_AUTH_TOKEN environment variable is required.");
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl.replace('libsql://', 'https://'),
    authToken: tursoToken,
  });

  console.log('Syncing Turso schema with Reseller Support tables...');

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "ResellerTicket" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "ticketCode" TEXT UNIQUE NOT NULL,
        "tenantId" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'GENERAL',
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ ResellerTicket table verified in Turso');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS "ResellerTicketMessage" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "ticketId" TEXT NOT NULL,
        "senderRole" TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("ticketId") REFERENCES "ResellerTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ ResellerTicketMessage table verified in Turso');

    try {
      await client.execute(`CREATE INDEX IF NOT EXISTS "ResellerTicket_tenantId_idx" ON "ResellerTicket"("tenantId");`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "ResellerTicket_status_idx" ON "ResellerTicket"("status");`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "ResellerTicket_createdAt_idx" ON "ResellerTicket"("createdAt");`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "ResellerTicketMessage_ticketId_idx" ON "ResellerTicketMessage"("ticketId");`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "ResellerTicketMessage_createdAt_idx" ON "ResellerTicketMessage"("createdAt");`);
      console.log('✅ Indexes verified in Turso');
    } catch (e) {
      console.log('ℹ️ Index creation note:', e.message);
    }

    console.log('🎉 Reseller Support tables successfully synced to Turso!');
  } catch (err) {
    console.error('Turso sync error:', err);
    process.exit(1);
  }
}

syncSupportTables();
