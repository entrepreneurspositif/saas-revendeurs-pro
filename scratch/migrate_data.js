const { createClient } = require('@libsql/client');
const { PrismaClient } = require('@prisma/client');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  console.log("Connecting to Turso Cloud DB...");
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });
  const localPrisma = new PrismaClient({ datasources: { db: { url: "file:./prisma/dev.db" } } });

  // 1. Create Tables DDL on Turso
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS "Supplier" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'canboso',
      "apiUrl" TEXT NOT NULL,
      "apiKey" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "reliabilityScore" REAL NOT NULL DEFAULT 99.0,
      "balance" REAL NOT NULL DEFAULT 0.0,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "SupplierProduct" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "supplierId" TEXT NOT NULL,
      "externalId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "productType" TEXT,
      "costPrice" REAL NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "stock" INTEGER NOT NULL DEFAULT 0,
      "sold" INTEGER NOT NULL DEFAULT 0,
      "image" TEXT,
      "emoji" TEXT,
      "isAvailable" BOOLEAN NOT NULL DEFAULT 1,
      "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "description" TEXT,
      "category" TEXT NOT NULL DEFAULT 'Général',
      "sellingPrice" REAL NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "activeSupplierId" TEXT,
      "activeSupplierProductId" TEXT,
      "imageUrl" TEXT,
      "badge" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("activeSupplierProductId") REFERENCES "SupplierProduct" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
      "walletBalance" REAL NOT NULL DEFAULT 100.0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "productTitle" TEXT NOT NULL,
      "supplierId" TEXT,
      "supplierProductId" TEXT,
      "ticketCode" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "unitCostPrice" REAL NOT NULL,
      "unitSellingPrice" REAL NOT NULL,
      "totalAmount" REAL NOT NULL,
      "profitMargin" REAL NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
      "deliveredCredentials" TEXT,
      "paymentInstructions" TEXT,
      "errorMessage" TEXT,
      "idempotencyKey" TEXT NOT NULL,
      "supplierOrderRef" TEXT,
      "supportStatus" TEXT NOT NULL DEFAULT 'OPEN',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "ChatMessage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ticketCode" TEXT NOT NULL,
      "sender" TEXT NOT NULL,
      "text" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("ticketCode") REFERENCES "Order" ("ticketCode") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Setting" (
      "key" TEXT NOT NULL PRIMARY KEY,
      "value" TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "OtpOrder" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ticketCode" TEXT NOT NULL,
      "tzid" INTEGER NOT NULL DEFAULT 0,
      "phone" TEXT NOT NULL DEFAULT '',
      "service" TEXT NOT NULL,
      "country" TEXT NOT NULL DEFAULT '1',
      "costPrice" REAL NOT NULL DEFAULT 0,
      "sellingPrice" REAL NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
      "paymentInstructions" TEXT,
      "errorMessage" TEXT,
      "smsCode" TEXT,
      "fullSms" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "ProductRequest" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerName" TEXT NOT NULL,
      "contactInfo" TEXT NOT NULL,
      "productName" TEXT NOT NULL,
      "description" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "PromoCode" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "code" TEXT NOT NULL,
      "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
      "discountValue" REAL NOT NULL,
      "minPurchaseAmount" REAL NOT NULL DEFAULT 0.0,
      "maxUses" INTEGER,
      "usedCount" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "expiresAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`
  ];

  console.log("Creating tables on Turso Cloud Database...");
  for (const ddl of ddlStatements) {
    await turso.execute(ddl);
  }
  console.log("✅ All tables created successfully!");

  // 2. Read local rows and insert into Turso
  const suppliers = await localPrisma.supplier.findMany();
  for (const s of suppliers) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "Supplier" ("id", "name", "type", "apiUrl", "apiKey", "isActive", "reliabilityScore", "balance", "notes", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [s.id, s.name, s.type, s.apiUrl, s.apiKey, s.isActive ? 1 : 0, s.reliabilityScore, s.balance, s.notes, s.createdAt.toISOString(), s.updatedAt.toISOString()]
    });
  }
  console.log(`Migrated ${suppliers.length} Suppliers`);

  const supplierProducts = await localPrisma.supplierProduct.findMany();
  for (const sp of supplierProducts) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "SupplierProduct" ("id", "supplierId", "externalId", "name", "description", "productType", "costPrice", "currency", "stock", "sold", "image", "emoji", "isAvailable", "lastSyncedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [sp.id, sp.supplierId, sp.externalId, sp.name, sp.description, sp.productType, sp.costPrice, sp.currency, sp.stock, sp.sold, sp.image, sp.emoji, sp.isAvailable ? 1 : 0, sp.lastSyncedAt.toISOString()]
    });
  }
  console.log(`Migrated ${supplierProducts.length} Supplier Products`);

  const products = await localPrisma.product.findMany();
  for (const p of products) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "Product" ("id", "title", "slug", "description", "category", "sellingPrice", "currency", "isActive", "activeSupplierId", "activeSupplierProductId", "imageUrl", "badge", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.title, p.slug, p.description, p.category, p.sellingPrice, p.currency, p.isActive ? 1 : 0, p.activeSupplierId, p.activeSupplierProductId, p.imageUrl, p.badge, p.createdAt.toISOString(), p.updatedAt.toISOString()]
    });
  }
  console.log(`Migrated ${products.length} Products`);

  const users = await localPrisma.user.findMany();
  for (const u of users) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "User" ("id", "email", "name", "role", "walletBalance", "createdAt") VALUES (?, ?, ?, ?, ?, ?)`,
      args: [u.id, u.email, u.name, u.role, u.walletBalance, u.createdAt.toISOString()]
    });
  }
  console.log(`Migrated ${users.length} Users`);

  const settings = await localPrisma.setting.findMany();
  for (const st of settings) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "Setting" ("key", "value") VALUES (?, ?)`,
      args: [st.key, st.value]
    });
  }
  console.log(`Migrated ${settings.length} Settings`);

  const otpOrders = await localPrisma.otpOrder.findMany();
  for (const o of otpOrders) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "OtpOrder" ("id", "ticketCode", "tzid", "phone", "service", "country", "costPrice", "sellingPrice", "status", "paymentInstructions", "errorMessage", "smsCode", "fullSms", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [o.id, o.ticketCode, o.tzid, o.phone, o.service, o.country, o.costPrice, o.sellingPrice, o.status, o.paymentInstructions, o.errorMessage, o.smsCode, o.fullSms, o.createdAt.toISOString(), o.updatedAt.toISOString()]
    });
  }
  console.log(`Migrated ${otpOrders.length} OTP Orders`);

  const requests = await localPrisma.productRequest.findMany();
  for (const r of requests) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "ProductRequest" ("id", "customerName", "contactInfo", "productName", "description", "status", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.customerName, r.contactInfo, r.productName, r.description, r.status, r.createdAt.toISOString(), r.updatedAt.toISOString()]
    });
  }
  console.log(`Migrated ${requests.length} Product Requests`);

  const promos = await localPrisma.promoCode.findMany();
  for (const pr of promos) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO "PromoCode" ("id", "code", "discountType", "discountValue", "minPurchaseAmount", "maxUses", "usedCount", "isActive", "expiresAt", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [pr.id, pr.code, pr.discountType, pr.discountValue, pr.minPurchaseAmount, pr.maxUses, pr.usedCount, pr.isActive ? 1 : 0, pr.expiresAt ? pr.expiresAt.toISOString() : null, pr.createdAt.toISOString(), pr.updatedAt.toISOString()]
    });
  }
  console.log(`Migrated ${promos.length} Promo Codes`);

  console.log("\n🎉 SUCCESS! FULL DATABASE MIGRATED TO TURSO CLOUD!");
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
