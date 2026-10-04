const { execSync } = require('child_process');

const tursoUrl = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

try {
  console.log("Updating TURSO_DATABASE_URL to HTTPS...");
  try { execSync(`npx vercel env rm TURSO_DATABASE_URL production -y`, { stdio: 'inherit' }); } catch(e) {}
  execSync(`npx vercel env add TURSO_DATABASE_URL production`, {
    input: tursoUrl,
    encoding: 'utf-8',
    stdio: ['pipe', 'inherit', 'inherit']
  });

  console.log("Updating DATABASE_URL to HTTPS...");
  try { execSync(`npx vercel env rm DATABASE_URL production -y`, { stdio: 'inherit' }); } catch(e) {}
  execSync(`npx vercel env add DATABASE_URL production`, {
    input: tursoUrl,
    encoding: 'utf-8',
    stdio: ['pipe', 'inherit', 'inherit']
  });

  console.log("Vercel envs updated to HTTPS!");
} catch (err) {
  console.error("Error updating envs:", err.message);
}
