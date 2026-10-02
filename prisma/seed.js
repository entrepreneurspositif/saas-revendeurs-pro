const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reseller.com' },
    update: {},
    create: {
      email: 'admin@reseller.com',
      name: 'Administrateur',
      role: 'ADMIN',
      walletBalance: 1000.0,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Jean Dupont',
      role: 'CUSTOMER',
      walletBalance: 250.0,
    },
  });

  // 2. Create Suppliers
  const canbosoSupplier = await prisma.supplier.upsert({
    where: { id: 'supp_canboso_01' },
    update: {
      apiKey: 'tgb_2e65bb617446f076e223965887bae9e5ee0118a499d1c316',
      apiUrl: 'https://canboso.com',
    },
    create: {
      id: 'supp_canboso_01',
      name: 'Canboso API',
      type: 'canboso',
      apiUrl: 'https://canboso.com',
      apiKey: 'tgb_2e65bb617446f076e223965887bae9e5ee0118a499d1c316',
      isActive: true,
      reliabilityScore: 99.5,
      balance: 340.50,
      notes: 'Fournisseur principal API Telegram, comptes IA, Locket Gold et JetBrains',
    },
  });

  const secondarySupplier = await prisma.supplier.upsert({
    where: { id: 'supp_techsupply_02' },
    update: {},
    create: {
      id: 'supp_techsupply_02',
      name: 'TechSupply Direct',
      type: 'custom_api',
      apiUrl: 'https://api.techsupply.io',
      apiKey: 'ts_key_demo_8849302',
      isActive: true,
      reliabilityScore: 92.0,
      balance: 110.00,
      notes: 'Fournisseur secondaire alternatif pour comparer les prix et le stock',
    },
  });

  // 3. Sync live products from Canboso API
  console.log('📡 Fetching live products from Canboso API...');
  try {
    const res = await fetch('https://canboso.com/api/v2/telegram-buyer/products', {
      headers: {
        'x-api-key': canbosoSupplier.apiKey,
        'Authorization': `Bearer ${canbosoSupplier.apiKey}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const liveProducts = Array.isArray(data) ? data : (data.products || []);
      console.log(`✅ Received ${liveProducts.length} live products from Canboso!`);

      for (const item of liveProducts) {
        const costPrice = item.price?.amount || 1.99;
        const stock = item.availability?.available ?? 10;
        const sold = item.availability?.sold ?? 0;

        // Upsert Supplier Product
        const suppProd = await prisma.supplierProduct.upsert({
          where: {
            supplierId_externalId: {
              supplierId: canbosoSupplier.id,
              externalId: item.productId,
            },
          },
          update: {
            name: item.name,
            description: item.description,
            costPrice: costPrice,
            stock: stock,
            sold: sold,
            productType: item.productType,
            emoji: item.emoji,
            image: item.image,
            isAvailable: stock > 0,
            lastSyncedAt: new Date(),
          },
          create: {
            supplierId: canbosoSupplier.id,
            externalId: item.productId,
            name: item.name,
            description: item.description,
            costPrice: costPrice,
            currency: item.price?.currency || 'USD',
            stock: stock,
            sold: sold,
            productType: item.productType,
            emoji: item.emoji,
            image: item.image,
            isAvailable: stock > 0,
          },
        });

        // Categorize
        let category = 'Abonnements & Comptes';
        const nameLower = item.name.toLowerCase();
        if (nameLower.includes('api') || nameLower.includes('qwen') || nameLower.includes('manus') || nameLower.includes('claude') || nameLower.includes('higg')) {
          category = 'IA & APIs';
        } else if (nameLower.includes('jetbrains') || nameLower.includes('linkedin') || nameLower.includes('code')) {
          category = 'Licences & Outils Dev';
        } else if (nameLower.includes('locket') || nameLower.includes('gold')) {
          category = 'Mobile & Services';
        }

        // Custom retail price set by admin (+65% to +100% margin default)
        const sellingPrice = parseFloat((costPrice * 1.75).toFixed(2));
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + item.productId.slice(-4);

        // Master product in store
        await prisma.product.upsert({
          where: { slug: slug },
          update: {
            title: item.name,
            description: item.description,
            category: category,
            activeSupplierId: canbosoSupplier.id,
            activeSupplierProductId: suppProd.id,
            imageUrl: item.image,
          },
          create: {
            title: item.name,
            slug: slug,
            description: item.description,
            category: category,
            sellingPrice: sellingPrice,
            currency: 'USD',
            isActive: true,
            activeSupplierId: canbosoSupplier.id,
            activeSupplierProductId: suppProd.id,
            imageUrl: item.image,
            badge: stock > 50 ? 'EN STOCK' : stock < 5 ? 'STOCK LIMITÉ' : 'HOT',
          },
        });
      }

      // Add a couple of comparative offers for TechSupply Direct
      if (liveProducts.length > 0) {
        const item1 = liveProducts[0];
        const item2 = liveProducts[Math.min(2, liveProducts.length - 1)];

        await prisma.supplierProduct.upsert({
          where: {
            supplierId_externalId: {
              supplierId: secondarySupplier.id,
              externalId: 'tech_' + item1.productId,
            },
          },
          update: {},
          create: {
            supplierId: secondarySupplier.id,
            externalId: 'tech_' + item1.productId,
            name: item1.name + ' [Offre TechSupply]',
            description: item1.description,
            costPrice: parseFloat((item1.price.amount * 0.95).toFixed(2)),
            currency: 'USD',
            stock: 12,
            sold: 4,
            productType: item1.productType,
            isAvailable: true,
          },
        });

        await prisma.supplierProduct.upsert({
          where: {
            supplierId_externalId: {
              supplierId: secondarySupplier.id,
              externalId: 'tech_' + item2.productId,
            },
          },
          update: {},
          create: {
            supplierId: secondarySupplier.id,
            externalId: 'tech_' + item2.productId,
            name: item2.name + ' [Offre TechSupply]',
            description: item2.description,
            costPrice: parseFloat((item2.price.amount * 1.1).toFixed(2)),
            currency: 'USD',
            stock: 8,
            sold: 2,
            productType: item2.productType,
            isAvailable: true,
          },
        });
      }
    } else {
      console.error('API return non-ok status:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error fetching live Canboso products in seed:', err);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
