const { createClient } = require('@libsql/client');
const fetch = require('node-fetch');

const url = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

const client = createClient({ url, authToken });

async function registerWebhook() {
  const res = await client.execute("SELECT * FROM Setting WHERE key = 'telegram_bot_token'");
  if (res.rows.length === 0 || !res.rows[0].value) {
    console.error('No Telegram bot token found in DB!');
    return;
  }

  const botToken = String(res.rows[0].value).trim();
  console.log('Bot token found:', botToken.slice(0, 10) + '...');

  const webhookUrl = "https://revente-abonnement.vercel.app/api/telegram/webhook";
  console.log('Registering webhook URL:', webhookUrl);

  const apiRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
  const data = await apiRes.json();
  console.log('Telegram setWebhook response:', JSON.stringify(data, null, 2));

  // Register commands menu
  const cmdRes = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'start', description: '🚀 Menu principal & Tableau de bord' },
        { command: 'suivi', description: '🔍 Suivre un ticket (ex: /suivi TK-123)' },
        { command: 'catalogue', description: '📦 Voir les produits & abonnements' },
        { command: 'otp', description: '📱 Numéros virtuels & SMS OTP' },
        { command: 'support', description: '💬 Support client & Assistance' },
        { command: 'stats', description: '📊 Statistiques globales de la boutique' },
      ],
    }),
  });
  const cmdData = await cmdRes.json();
  console.log('Telegram setMyCommands response:', JSON.stringify(cmdData, null, 2));
}

registerWebhook().catch(console.error);
