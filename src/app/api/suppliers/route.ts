import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function isValidPublicApiUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const hostname = url.hostname.toLowerCase();
    
    // Block private/loopback/metadata addresses
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

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
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { name, type, apiUrl, apiKey, notes, reliabilityScore, balance } = body;

    if (!name || !apiUrl || !apiKey) {
      return NextResponse.json(
        { success: false, message: 'Nom, URL API et Clé API sont requis' },
        { status: 400 }
      );
    }

    if (!isValidPublicApiUrl(apiUrl)) {
      return NextResponse.json(
        { success: false, message: 'URL API invalide ou non autorisée (les adresses locales, privées et loopback sont interdites)' },
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
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { id, name, apiUrl, apiKey, isActive, reliabilityScore, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID Fournisseur requis' }, { status: 400 });
    }

    if (apiUrl && !isValidPublicApiUrl(apiUrl)) {
      return NextResponse.json(
        { success: false, message: 'URL API invalide ou non autorisée' },
        { status: 400 }
      );
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
