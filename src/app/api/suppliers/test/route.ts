import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupplierDriver } from '@/lib/suppliers/factory';

export async function POST(req: NextRequest) {
  try {
    const { supplierId } = await req.json();

    if (!supplierId) {
      return NextResponse.json({ success: false, message: 'ID Fournisseur requis' }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Fournisseur non trouvé' }, { status: 404 });
    }

    const driver = createSupplierDriver(supplier);
    const testRes = await driver.testConnection();

    if (testRes.success && testRes.balance !== undefined) {
      await prisma.supplier.update({
        where: { id: supplierId },
        data: { balance: testRes.balance },
      });
    }

    return NextResponse.json(testRes);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
