import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import { requireAdmin } from '@/lib/adminAuth';
import { isMaliciousPayload, sanitizeText, sanitizeMultilineText } from '@/lib/sanitizer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/product-requests
 * Restricted to Super Admin.
 */
export async function GET(req: NextRequest) {
  try {
    const authError = requireAdmin(req);
    if (authError) return authError;

    const requests = await prisma.productRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/product-requests
 * Public submission of custom product request.
 * Strictly validated and sanitized against XSS and probe injections.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, contactInfo, productName, description } = body;

    // 1. Check for malicious payloads or exfiltration domains
    if (
      isMaliciousPayload(customerName) ||
      isMaliciousPayload(contactInfo) ||
      isMaliciousPayload(productName) ||
      isMaliciousPayload(description)
    ) {
      console.warn('[SECURITY] Malicious product request blocked:', {
        customerName: String(customerName).slice(0, 100),
        contactInfo: String(contactInfo).slice(0, 100),
        productName: String(productName).slice(0, 100),
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Votre demande a été rejetée car elle contient des caractères ou liens non autorisés.',
        },
        { status: 400 }
      );
    }

    // 2. Deep sanitization
    const cleanCustomerName = sanitizeText(customerName, 100);
    const cleanContactInfo = sanitizeText(contactInfo, 100);
    const cleanProductName = sanitizeText(productName, 150);
    const cleanDescription = sanitizeMultilineText(description, 1000);

    if (!cleanCustomerName || !cleanContactInfo || !cleanProductName) {
      return NextResponse.json(
        { success: false, message: 'Le nom, la coordonnée de contact et le nom du produit sont requis.' },
        { status: 400 }
      );
    }

    const newRequest = await prisma.productRequest.create({
      data: {
        customerName: cleanCustomerName,
        contactInfo: cleanContactInfo,
        productName: cleanProductName,
        description: cleanDescription,
        status: 'PENDING',
      },
    });

    // Send Telegram Notification to Admin (using safe sanitized data)
    sendTelegramNotification({
      title: `Demande : ${newRequest.productName}`,
      type: 'REQUEST',
      details: `Client : ${newRequest.customerName}\nContact : ${newRequest.contactInfo}\nNote : ${newRequest.description || 'Aucune'}`,
    }).catch((err) => console.error('Telegram Request notification error:', err));

    return NextResponse.json({
      success: true,
      message: 'Votre demande de produit a été enregistrée avec succès ! Notre équipe vous recontactera dès sa disponibilité.',
      request: newRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/product-requests
 * Restricted to Super Admin.
 */
export async function PUT(req: NextRequest) {
  try {
    const authError = requireAdmin(req);
    if (authError) return authError;

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'ID et statut requis' }, { status: 400 });
    }

    const allowedStatuses = ['PENDING', 'CONTACTED', 'FULFILLED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Statut invalide' }, { status: 400 });
    }

    const updated = await prisma.productRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/product-requests
 * Restricted to Super Admin.
 */
export async function DELETE(req: NextRequest) {
  try {
    const authError = requireAdmin(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID requis' }, { status: 400 });
    }

    await prisma.productRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Demande supprimée' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
