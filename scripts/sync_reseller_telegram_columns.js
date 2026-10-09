const { createClient } = require('@libsql/client');

async function syncTenantTelegramColumns() {
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

  console.log('Adding Telegram notification columns to Tenant table in Turso...');

  const columns = [
    { name: 'telegramBotToken', type: 'TEXT' },
    { name: 'telegramChatId', type: 'TEXT' },
    { name: 'telegramNotificationsEnabled', type: 'BOOLEAN DEFAULT 0' },
    { name: 'notifyOnNewOrder', type: 'BOOLEAN DEFAULT 1' },
    { name: 'notifyOnOtpOrder', type: 'BOOLEAN DEFAULT 1' },
    { name: 'notifyOnSupportReply', type: 'BOOLEAN DEFAULT 1' },
    { name: 'notifyOnPayout', type: 'BOOLEAN DEFAULT 1' },
  ];

  for (const col of columns) {
    try {
      await client.execute(`ALTER TABLE "Tenant" ADD COLUMN "${col.name}" ${col.type};`);
      console.log(`✅ Added column ${col.name}`);
    } catch (e) {
      console.log(`ℹ️ Column ${col.name} already exists or error:`, e.message);
    }
  }

  console.log('🎉 Turso columns synced successfully!');
}

syncTenantTelegramColumns();
