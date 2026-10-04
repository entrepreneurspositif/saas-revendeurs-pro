const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  console.log("Testing PrismaLibSql with direct config object...");
  const adapter = new PrismaLibSql({
    url: tursoUrl,
    authToken: tursoToken,
  });

  const prisma = new PrismaClient({ adapter });

  const settings = await prisma.setting.findMany();
  console.log("🎉 SUCCESS! PRISMA QUERY ON TURSO RETURNED:", settings);

  const suppliers = await prisma.supplier.findMany();
  console.log("Turso Suppliers count:", suppliers.length);
}

main().catch(err => console.error("Test error:", err));
