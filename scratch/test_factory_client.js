const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const { PrismaClient } = require('@prisma/client');

const tursoUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  const client = createClient({ url: tursoUrl, authToken: tursoToken });
  const adapterFactory = new PrismaLibSql(client);
  console.log("Calling createClient on adapterFactory...");
  
  // Test passing factory or created client
  const adapter = await adapterFactory.createClient();
  console.log("Adapter client created:", adapter);

  const prisma = new PrismaClient({ adapter });
  const settings = await prisma.setting.findMany();
  console.log("🎉 SUCCESS! PRISMA QUERY ON TURSO CLOUD RETURNED:", settings);
}

main().catch(err => console.error("Test error:", err));
