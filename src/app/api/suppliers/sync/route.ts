import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { getPricingRules, calculateSellingPriceFromCost } from '@/lib/pricingHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { supplierId } = await req.json().catch(() => ({ supplierId: null }));

    const whereClause = supplierId ? { id: supplierId, isActive: true } : { isActive: true };
    const suppliers = await prisma.supplier.findMany({ where: whereClause });

    const pricingRules = await getPricingRules();
    let totalSynced = 0;

    for (const supplier of suppliers) {
      try {
        const driver = createSupplierDriver(supplier);

        // Fetch live balance from supplier API if driver supports it
        if (driver.fetchBalance) {
          const liveBalance = await driver.fetchBalance();
          await prisma.supplier.update({
            where: { id: supplier.id },
            data: { balance: liveBalance },
          });
        }

        const products = await driver.fetchProducts();

        for (const item of products) {
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
            });
          } else {
            // Update selling price based on cost price and margin rules
            await prisma.product.update({
              where: { id: existingMaster.id },
              data: {
                sellingPrice: calculatedSellingPrice,
                activeSupplierId: supplier.id,
                activeSupplierProductId: suppProd.id,
              },
            });
          }
          totalSynced++;
        }
      } catch (err: any) {
        console.error(`Error syncing supplier ${supplier.name}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation réussie! Catalogue et solde direct mis à jour pour ${suppliers.length} fournisseur(s).`,
      count: totalSynced,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
