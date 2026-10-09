import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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

    // Handle JSON Base64 Upload
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { data, filename = 'logo.png' } = body;

      if (!data || typeof data !== 'string' || !data.startsWith('data:image/')) {
        return NextResponse.json(
          { success: false, message: 'Format d\'image base64 invalide' },
          { status: 400 }
        );
      }

      const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { success: false, message: 'Données base64 corrompues' },
          { status: 400 }
        );
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'png';
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('svg')) ext = 'svg';

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
      await fs.promises.mkdir(uploadDir, { recursive: true });

      const uniqueFilename = `logo_${tenant.subdomain}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/logos/${uniqueFilename}`;

      // Update tenant logoUrl in DB
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { logoUrl: publicUrl },
      });

      return NextResponse.json({
        success: true,
        message: 'Logo téléversé avec succès !',
        url: publicUrl,
      });
    }

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

    let ext = 'png';
    if (file.name.includes('.')) {
      ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    } else if (file.type.includes('jpeg')) {
      ext = 'jpg';
    } else if (file.type.includes('webp')) {
      ext = 'webp';
    } else if (file.type.includes('svg')) {
      ext = 'svg';
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const uniqueFilename = `logo_${tenant.subdomain}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${uniqueFilename}`;

    // Update tenant logoUrl in DB
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { logoUrl: publicUrl },
    });

    return NextResponse.json({
      success: true,
      message: 'Logo téléversé et appliqué avec succès !',
      url: publicUrl,
    });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
