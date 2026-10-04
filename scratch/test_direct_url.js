const { PrismaClient } = require('@prisma/client');

const tursoDbUrl = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

async function main() {
  console.log("Testing direct DATABASE_URL with Turso...");
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: tursoDbUrl
      }
    }
  });

  const settings = await prisma.setting.findMany();
  console.log("Turso Direct URL query result:", settings);
}

main().catch(err => console.error("Direct URL test error:", err));
