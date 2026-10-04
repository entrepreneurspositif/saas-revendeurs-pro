const { prisma } = require('../src/lib/prisma');
const { createSupplierDriver } = require('../src/lib/suppliers/factory');

async function testPrismaSync() {
  console.log('Testing prisma supplier sync for InsightXPro...');
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true }
  });
  console.log(`Found ${suppliers.length} active suppliers:`, suppliers.map(s => `${s.name} (${s.type})`));

  for (const supplier of suppliers) {
    if (supplier.name.toLowerCase().includes('insight')) {
      const driver = createSupplierDriver(supplier);
      console.log('Driver class created:', driver.constructor.name);
      
      const balance = await driver.fetchBalance();
      console.log(`Live balance for ${supplier.name}: $${balance}`);
      
      const prods = await driver.fetchProducts();
      console.log(`Live products from driver for ${supplier.name}: ${prods.length}`);
      if (prods.length > 0) {
        console.log('Sample product:', prods[0]);
      }
    }
  }
}

testPrismaSync().catch(console.error);
