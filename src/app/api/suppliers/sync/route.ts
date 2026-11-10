import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';
import { getPricingRules, calculateSellingPriceFromCost } from '@/lib/pricingHelper';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface SyncState {
  isSyncing: boolean;
  startedAt: number;
  finishedAt?: number;
  message: string;
  result?: any;
  error?: string | null;
}

// Module-level fallback state
let inMemorySyncState: SyncState = {
  isSyncing: false,
  startedAt: 0,
  message: 'Prêt',
};

async function getSyncState(): Promise<SyncState> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'supplier_sync_state' },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value) as SyncState;
      // Auto-expire stale sync after 5 minutes
      if (parsed.isSyncing && Date.now() - parsed.startedAt > 300000) {
        parsed.isSyncing = false;
        parsed.message = 'Synchronisation précédente expirée';
      }
      return parsed;
    }
  } catch (e) {
    // Fall back to memory
  }
  return inMemorySyncState;
}

async function setSyncState(state: Partial<SyncState>) {
  inMemorySyncState = { ...inMemorySyncState, ...state };
  try {
    await prisma.setting.upsert({
      where: { key: 'supplier_sync_state' },
      update: { value: JSON.stringify(inMemorySyncState) },
      create: { key: 'supplier_sync_state', value: JSON.stringify(inMemorySyncState) },
    }).catch(console.error);
  } catch (e) {
    // Ignore DB errors on state update
  }
}

async function executeSupplierSync(supplierId?: string | null) {
  const whereClause = supplierId ? { id: supplierId, isActive: true } : { isActive: true };
  const suppliers = await prisma.supplier.findMany({ where: whereClause });

  const pricingRules = await getPricingRules();
  let totalSynced = 0;
  let inStockTotal = 0;
  let outOfStockTotal = 0;

  // Pre-load all existing supplier products and master products in parallel
  const [existingSuppProds, allExistingMasters] = await Promise.all([
    prisma.supplierProduct.findMany({
      where: supplierId ? { supplierId } : undefined,
      select: {
        id: true,
        supplierId: true,
        externalId: true,
        costPrice: true,
        stock: true,
        isAvailable: true,
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        sellingPrice: true,
        activeSupplierId: true,
        activeSupplierProductId: true,
      },
    }),
  ]);

  const suppProdMap = new Map<string, typeof existingSuppProds[0]>();
  existingSuppProds.forEach((sp) => suppProdMap.set(`${sp.supplierId}_${sp.externalId}`, sp));

  const masterMap = new Map<string, typeof allExistingMasters[0]>();
  allExistingMasters.forEach((m) => masterMap.set(m.slug, m));

  for (const supplier of suppliers) {
    try {
      const driver = createSupplierDriver(supplier);

      // Fetch live balance from supplier API if driver supports it
      if (driver.fetchBalance) {
        try {
          const liveBalance = await driver.fetchBalance();
          await prisma.supplier.update({
            where: { id: supplier.id },
            data: { balance: liveBalance },
          }).catch(console.error);
        } catch (e) {
          console.warn(`Could not fetch balance for ${supplier.name}:`, e);
        }
      }

      await setSyncState({
        message: `Récupération du catalogue chez ${supplier.name}...`,
      });

      const products = await driver.fetchProducts().catch((err: any) => {
        console.error(`Error fetching products from ${supplier.name}:`, err);
        return [];
      });

      if (!Array.isArray(products) || products.length === 0) {
        continue;
      }

      const currentExternalIds = new Set<string>();
      const itemsNeedingDbSync: Array<{
        item: typeof products[0];
        extId: string;
        costPrice: number;
        stock: number;
        existingId?: string;
      }> = [];

      for (const item of products) {
        const extId = String(item.externalId);
        currentExternalIds.add(extId);

        const stock = Math.max(0, Math.floor(Number(item.stock || 0)));
        if (stock > 0) inStockTotal++;
        else outOfStockTotal++;

        const costPrice = Number(item.costPrice || 0);
        const mapKey = `${supplier.id}_${extId}`;
        const existing = suppProdMap.get(mapKey);

        // Fast diffing: skip DB write if price & stock haven't changed
        if (existing && existing.costPrice === costPrice && existing.stock === stock) {
          totalSynced++;
          continue;
        }

        itemsNeedingDbSync.push({
          item,
          extId,
          costPrice,
          stock,
          existingId: existing?.id,
        });
      }

      await setSyncState({
        message: `Mise à jour de la base de données pour ${supplier.name} (${itemsNeedingDbSync.length} modifiés sur ${products.length})...`,
      });

      // Process modified products in concurrent chunks of 15
      const CHUNK_SIZE = 15;
      for (let i = 0; i < itemsNeedingDbSync.length; i += CHUNK_SIZE) {
        const chunk = itemsNeedingDbSync.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(async ({ item, extId, costPrice, stock }) => {
            try {
              const suppProd = await prisma.supplierProduct.upsert({
                where: {
                  supplierId_externalId: {
                    supplierId: supplier.id,
                    externalId: extId,
                  },
                },
                update: {
                  name: item.name,
                  description: item.description,
                  costPrice,
                  stock,
                  sold: item.sold,
                  productType: item.productType,
                  emoji: item.emoji,
                  image: item.image,
                  isAvailable: stock > 0,
                  lastSyncedAt: new Date(),
                },
                create: {
                  supplierId: supplier.id,
                  externalId: extId,
                  name: item.name,
                  description: item.description,
                  costPrice,
                  currency: item.currency || 'USD',
                  stock,
                  sold: item.sold,
                  productType: item.productType,
                  emoji: item.emoji,
                  image: item.image,
                  isAvailable: stock > 0,
                },
              });

              const slug =
                item.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '') +
                '-' +
                extId.slice(-4);

              const calculatedSellingPrice = calculateSellingPriceFromCost(costPrice, pricingRules);
              const existingMaster = masterMap.get(slug);

              if (!existingMaster) {
                const createdMaster = await prisma.product.create({
                  data: {
                    title: item.name,
                    slug,
                    description: item.description,
                    category:
                      item.name.toLowerCase().includes('api') || item.name.toLowerCase().includes('bot')
                        ? 'IA & APIs'
                        : 'Abonnements & Comptes',
                    sellingPrice: calculatedSellingPrice,
                    currency: 'USD',
                    isActive: true,
                    activeSupplierId: supplier.id,
                    activeSupplierProductId: suppProd.id,
                    imageUrl: item.image,
                  },
                }).catch(() => null);

                if (createdMaster) {
                  masterMap.set(slug, createdMaster as any);
                }
              } else {
                if (
                  existingMaster.sellingPrice !== calculatedSellingPrice ||
                  existingMaster.activeSupplierProductId !== suppProd.id
                ) {
                  await prisma.product.update({
                    where: { id: existingMaster.id },
                    data: {
                      sellingPrice: calculatedSellingPrice,
                      activeSupplierId: supplier.id,
                      activeSupplierProductId: suppProd.id,
                    },
                  }).catch(console.error);
                }
              }

              totalSynced++;
            } catch (pErr) {
              console.error(`Error syncing product ${item.name}:`, pErr);
            }
          })
        );
      }

      // Mark missing products as out of stock
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

  const result = {
    success: true,
    message: `Synchronisation réussie ! ${totalSynced} produits vérifiés (${inStockTotal} en stock, ${outOfStockTotal} épuisés).`,
    count: totalSynced,
    inStock: inStockTotal,
    outOfStock: outOfStockTotal,
  };

  return result;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const currentState = await getSyncState();
    if (currentState.isSyncing) {
      return NextResponse.json({
        success: true,
        isSyncing: true,
        status: 'RUNNING',
        message: currentState.message || 'Une synchronisation est déjà en cours...',
      });
    }

    const { supplierId } = await req.json().catch(() => ({ supplierId: null }));

    // Start sync immediately in background
    await setSyncState({
      isSyncing: true,
      startedAt: Date.now(),
      message: 'Démarrage de la synchronisation du catalogue...',
      error: null,
    });

    // Run execution asynchronously without blocking the HTTP request
    executeSupplierSync(supplierId)
      .then(async (result) => {
        await setSyncState({
          isSyncing: false,
          finishedAt: Date.now(),
          result,
          message: result.message,
        });
      })
      .catch(async (err) => {
        console.error('Background sync failed:', err);
        await setSyncState({
          isSyncing: false,
          finishedAt: Date.now(),
          error: err.message,
          message: `Échec de la synchronisation: ${err.message}`,
        });
      });

    return NextResponse.json({
      success: true,
      isSyncing: true,
      status: 'STARTED',
      message: 'Synchronisation du catalogue lancée en tâche de fond...',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const state = await getSyncState();
    const lastSync = await prisma.setting.findUnique({
      where: { key: 'last_supplier_sync_timestamp' },
    });

    return NextResponse.json({
      success: true,
      isSyncing: state.isSyncing,
      message: state.message,
      lastSyncedAt: lastSync?.value ? new Date(Number(lastSync.value)).toISOString() : null,
      result: state.result || null,
      error: state.error || null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
