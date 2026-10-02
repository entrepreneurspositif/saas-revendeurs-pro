import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.productRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, contactInfo, productName, description } = body;

    if (!customerName || !contactInfo || !productName) {
      return NextResponse.json(
        { success: false, message: 'Le nom, la coordonnée de contact et le nom du produit sont requis.' },
        { status: 400 }
      );
    }

    const newRequest = await prisma.productRequest.create({
      data: {
        customerName: customerName.trim(),
        contactInfo: contactInfo.trim(),
        productName: productName.trim(),
        description: description ? description.trim() : '',
        status: 'PENDING',
      },
    });

    // Send Telegram Notification to Admin
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'ID et statut requis' }, { status: 400 });
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

export async function DELETE(req: NextRequest) {
  try {
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
