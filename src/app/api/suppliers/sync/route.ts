import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { getPricingRules, calculateSellingPriceFromCost } from '@/lib/pricingHelper';

export const dynamic = 'force-dynamic';

async function executeSupplierSync(supplierId?: string | null) {
  const whereClause = supplierId ? { id: supplierId, isActive: true } : { isActive: true };
  const suppliers = await prisma.supplier.findMany({ where: whereClause });

  const pricingRules = await getPricingRules();
  let totalSynced = 0;
  let inStockTotal = 0;
  let outOfStockTotal = 0;

  for (const supplier of suppliers) {
    try {
      const driver = createSupplierDriver(supplier);

      // Fetch live balance from supplier API if driver supports it
      if (driver.fetchBalance) {
        const liveBalance = await driver.fetchBalance();
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: { balance: liveBalance },
        }).catch(console.error);
      }

      const products = await driver.fetchProducts();
      const currentExternalIds = new Set<string>();

      for (const item of products) {
        currentExternalIds.add(item.externalId);

        const suppProd = await prisma.supplierProduct.upsert({
          where: {
            supplierId_externalId: {
              supplierId: supplier.id,
              externalId: item.externalId,
            },
          },
          update: {
            name: item.name,
            description: item.description,
            costPrice: item.costPrice,
            stock: item.stock,
            sold: item.sold,
            productType: item.productType,
            emoji: item.emoji,
            image: item.image,
            isAvailable: item.stock > 0,
            lastSyncedAt: new Date(),
          },
          create: {
            supplierId: supplier.id,
            externalId: item.externalId,
            name: item.name,
            description: item.description,
            costPrice: item.costPrice,
            currency: item.currency || 'USD',
            stock: item.stock,
            sold: item.sold,
            productType: item.productType,
            emoji: item.emoji,
            image: item.image,
            isAvailable: item.stock > 0,
          },
        });

        if (item.stock > 0) {
          inStockTotal++;
        } else {
          outOfStockTotal++;
        }

        // Check if master product exists or create one
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + item.externalId.slice(-4);
        const existingMaster = await prisma.product.findUnique({ where: { slug } });

        const calculatedSellingPrice = calculateSellingPriceFromCost(item.costPrice, pricingRules);

        if (!existingMaster) {
          await prisma.product.create({
            data: {
              title: item.name,
              slug,
              description: item.description,
              category: item.name.toLowerCase().includes('api') || item.name.toLowerCase().includes('bot') ? 'IA & APIs' : 'Abonnements & Comptes',
              sellingPrice: calculatedSellingPrice,
              currency: 'USD',
              isActive: true,
              activeSupplierId: supplier.id,
              activeSupplierProductId: suppProd.id,
              imageUrl: item.image,
            },
          }).catch(console.error);
        } else {
          await prisma.product.update({
            where: { id: existingMaster.id },
            data: {
              sellingPrice: calculatedSellingPrice,
              activeSupplierId: supplier.id,
              activeSupplierProductId: suppProd.id,
            },
          }).catch(console.error);
        }
        totalSynced++;
      }

      // Mark any products from this supplier that are NO LONGER in the supplier catalog as out of stock
      if (currentExternalIds.size > 0) {
        await prisma.supplierProduct.updateMany({
          where: {
            supplierId: supplier.id,
            externalId: { notIn: Array.from(currentExternalIds) },
          },
          data: {
            stock: 0,
            isAvailable: false,
          },
        }).catch(console.error);
      }
    } catch (err: any) {
      console.error(`Error syncing supplier ${supplier.name}:`, err);
    }
  }

  // Update last sync timestamp
  await prisma.setting.upsert({
    where: { key: 'last_supplier_sync_timestamp' },
    update: { value: String(Date.now()) },
    create: { key: 'last_supplier_sync_timestamp', value: String(Date.now()) },
  }).catch(console.error);

  return {
    success: true,
    message: `Synchronisation réussie ! ${totalSynced} produits mis à jour (${inStockTotal} en stock, ${outOfStockTotal} épuisés).`,
    count: totalSynced,
    inStock: inStockTotal,
    outOfStock: outOfStockTotal,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { supplierId } = await req.json().catch(() => ({ supplierId: null }));
    const result = await executeSupplierSync(supplierId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supplierId = req.nextUrl.searchParams.get('supplierId');
    const result = await executeSupplierSync(supplierId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
