import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let dataUrl = '';

    // Handle JSON Base64 Upload (Recommended & compressed client-side)
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      const { data } = body;

      if (!data || typeof data !== 'string' || !data.startsWith('data:image/')) {
        return NextResponse.json(
          { success: false, message: "Format d'image base64 invalide. Utilisez PNG, JPG, WebP ou SVG." },
          { status: 400 }
        );
      }

      dataUrl = data;
    } else {
      // Handle Multipart FormData Upload
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, message: 'Aucun fichier reçu' }, { status: 400 });
      }

      // Check size limit: 5MB
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'La taille du fichier ne doit pas dépasser 5 Mo' },
          { status: 400 }
        );
      }

      // Validate mime type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Format non supporté. Utilisez PNG, JPG, WebP ou SVG.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || 'image/png';
      dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    // Persist directly in Turso DB (reliable across all domains & restarts)
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { logoUrl: dataUrl },
    });

    return NextResponse.json({
      success: true,
      message: 'Logo téléversé et enregistré avec succès !',
      url: dataUrl,
    });
  } catch (error: any) {
    console.error('Error uploading reseller logo:', error);
    return NextResponse.json({ success: false, message: error.message || 'Erreur lors du téléversement du logo' }, { status: 500 });
  }
}
