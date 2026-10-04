const { createClient } = require('@libsql/client');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  const absPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  console.log("Reading local db from:", absPath);

  const localPrisma = new PrismaClient({
    datasources: { db: { url: `file:${absPath}` } }
  });

  const turso = createClient({ url: tursoUrl, authToken: tursoToken });

  // 1. Suppliers
  const suppliers = await localPrisma.supplier.findMany();
  for (const s of suppliers) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "Supplier" ("id", "name", "type", "apiUrl", "apiKey", "isActive", "reliabilityScore", "balance", "notes", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [s.id, s.name, s.type, s.apiUrl, s.apiKey, s.isActive ? 1 : 0, s.reliabilityScore, s.balance, s.notes, s.createdAt.toISOString(), s.updatedAt.toISOString()]
      });
    } catch(e) { console.error("Supplier err:", e.message); }
  }
  console.log(`Copied ${suppliers.length} Suppliers`);

  // 2. SupplierProducts
  const supplierProducts = await localPrisma.supplierProduct.findMany();
  console.log(`Found ${supplierProducts.length} local SupplierProducts, inserting...`);
  for (const sp of supplierProducts) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "SupplierProduct" ("id", "supplierId", "externalId", "name", "description", "productType", "costPrice", "currency", "stock", "sold", "image", "emoji", "isAvailable", "lastSyncedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [sp.id, sp.supplierId, sp.externalId, sp.name, sp.description, sp.productType, sp.costPrice, sp.currency, sp.stock, sp.sold, sp.image, sp.emoji, sp.isAvailable ? 1 : 0, sp.lastSyncedAt.toISOString()]
      });
    } catch(e) { console.error("SP err:", e.message); }
  }
  console.log(`Copied ${supplierProducts.length} Supplier Products`);

  // 3. Products
  const products = await localPrisma.product.findMany();
  for (const p of products) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "Product" ("id", "title", "slug", "description", "category", "sellingPrice", "currency", "isActive", "activeSupplierId", "activeSupplierProductId", "imageUrl", "badge", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, p.title, p.slug, p.description, p.category, p.sellingPrice, p.currency, p.isActive ? 1 : 0, p.activeSupplierId, p.activeSupplierProductId, p.imageUrl, p.badge, p.createdAt.toISOString(), p.updatedAt.toISOString()]
      });
    } catch(e) { console.error("P err:", e.message); }
  }
  console.log(`Copied ${products.length} Products`);

  // 4. Users
  const users = await localPrisma.user.findMany();
  for (const u of users) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "User" ("id", "email", "name", "role", "walletBalance", "createdAt") VALUES (?, ?, ?, ?, ?, ?)`,
        args: [u.id, u.email, u.name, u.role, u.walletBalance, u.createdAt.toISOString()]
      });
    } catch(e) { console.error("U err:", e.message); }
  }
  console.log(`Copied ${users.length} Users`);

  // 5. Settings
  const settings = await localPrisma.setting.findMany();
  for (const st of settings) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "Setting" ("key", "value") VALUES (?, ?)`,
        args: [st.key, st.value]
      });
    } catch(e) { console.error("St err:", e.message); }
  }
  console.log(`Copied ${settings.length} Settings`);

  // 6. Orders
  const orders = await localPrisma.order.findMany();
  for (const o of orders) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "Order" ("id", "userId", "productId", "productTitle", "supplierId", "supplierProductId", "ticketCode", "quantity", "unitCostPrice", "unitSellingPrice", "totalAmount", "profitMargin", "status", "deliveredCredentials", "paymentInstructions", "errorMessage", "idempotencyKey", "supplierOrderRef", "supportStatus", "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [o.id, o.userId, o.productId, o.productTitle, o.supplierId, o.supplierProductId, o.ticketCode, o.quantity, o.unitCostPrice, o.unitSellingPrice, o.totalAmount, o.profitMargin, o.status, o.deliveredCredentials, o.paymentInstructions, o.errorMessage, o.idempotencyKey, o.supplierOrderRef, o.supportStatus, o.createdAt.toISOString()]
      });
    } catch(e) { console.error("O err:", e.message); }
  }
  console.log(`Copied ${orders.length} Orders`);

  // 7. OTP Orders
  const otpOrders = await localPrisma.otpOrder.findMany();
  for (const o of otpOrders) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "OtpOrder" ("id", "ticketCode", "tzid", "phone", "service", "country", "costPrice", "sellingPrice", "status", "paymentInstructions", "errorMessage", "smsCode", "fullSms", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [o.id, o.ticketCode, o.tzid, o.phone, o.service, o.country, o.costPrice, o.sellingPrice, o.status, o.paymentInstructions, o.errorMessage, o.smsCode, o.fullSms, o.createdAt.toISOString(), o.updatedAt.toISOString()]
      });
    } catch(e) { console.error("OTP err:", e.message); }
  }
  console.log(`Copied ${otpOrders.length} OTP Orders`);

  // 8. Product Requests
  const requests = await localPrisma.productRequest.findMany();
  for (const r of requests) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "ProductRequest" ("id", "customerName", "contactInfo", "productName", "description", "status", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [r.id, r.customerName, r.contactInfo, r.productName, r.description, r.status, r.createdAt.toISOString(), r.updatedAt.toISOString()]
      });
    } catch(e) { console.error("Req err:", e.message); }
  }
  console.log(`Copied ${requests.length} Product Requests`);

  // 9. Promo Codes
  const promos = await localPrisma.promoCode.findMany();
  for (const pr of promos) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO "PromoCode" ("id", "code", "discountType", "discountValue", "minPurchaseAmount", "maxUses", "usedCount", "isActive", "expiresAt", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [pr.id, pr.code, pr.discountType, pr.discountValue, pr.minPurchaseAmount, pr.maxUses, pr.usedCount, pr.isActive ? 1 : 0, pr.expiresAt ? pr.expiresAt.toISOString() : null, pr.createdAt.toISOString(), pr.updatedAt.toISOString()]
      });
    } catch(e) { console.error("Promo err:", e.message); }
  }
  console.log(`Copied ${promos.length} Promo Codes`);

  console.log("\nMIGRATION TO TURSO CLOUD DATABASE COMPLETE!");
  await localPrisma.$disconnect();
}

main().catch(err => console.error("Copy error:", err));
