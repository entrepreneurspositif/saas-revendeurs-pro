const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken
  });

  const adapter = new PrismaLibSQL(libsql);
  console.log("Adapter created successfully!");

  const prisma = new PrismaClient({ adapter });

  const suppliers = await prisma.supplier.findMany();
  console.log("🎉 SUCCESS! Turso Suppliers count:", suppliers.length);
  console.log("First supplier:", suppliers[0]?.name);

  const productsCount = await prisma.product.count();
  console.log("🎉 SUCCESS! Turso Products count:", productsCount);
}

main().catch(err => console.error("TEST ERROR:", err));
