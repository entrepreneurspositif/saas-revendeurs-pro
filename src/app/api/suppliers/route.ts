import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { supplierProducts: true, orders: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, apiUrl, apiKey, notes, reliabilityScore, balance } = body;

    if (!name || !apiUrl || !apiKey) {
      return NextResponse.json(
        { success: false, message: 'Nom, URL API et Clé API sont requis' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        type: type || 'canboso',
        apiUrl,
        apiKey,
        notes,
        reliabilityScore: reliabilityScore ? Number(reliabilityScore) : 98.0,
        balance: balance ? Number(balance) : 0.0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, apiUrl, apiKey, isActive, reliabilityScore, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID Fournisseur requis' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (apiUrl !== undefined) updateData.apiUrl = apiUrl;
    if (apiKey !== undefined) updateData.apiKey = apiKey;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (reliabilityScore !== undefined) updateData.reliabilityScore = Number(reliabilityScore);
    if (notes !== undefined) updateData.notes = notes;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
