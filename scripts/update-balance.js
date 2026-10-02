const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBalance() {
  try {
    const res = await fetch('https://canboso.com/api/v2/telegram-buyer/balance', {
      headers: {
        'x-api-key': 'tgb_2e65bb617446f076e223965887bae9e5ee0118a499d1c316',
        'Authorization': 'Bearer tgb_2e65bb617446f076e223965887bae9e5ee0118a499d1c316',
      },
    });

    const data = await res.json();
    console.log('📡 Live Canboso API Balance Response:', data);

    if (data && (data.balanceUsd !== undefined || data.balance !== undefined)) {
      const liveBal = Number(data.balanceUsd ?? data.balance);
      await prisma.supplier.update({
        where: { id: 'supp_canboso_01' },
        data: { balance: liveBal },
      });
      console.log(`✅ Successfully updated Canboso live balance in database to $${liveBal.toFixed(2)}`);
    }
  } catch (e) {
    console.error('Error updating live balance:', e);
  } finally {
    await prisma.$disconnect();
  }
}

updateBalance();
