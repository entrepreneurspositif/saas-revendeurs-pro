import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification, sendResellerTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        name: true,
        storeName: true,
        walletBalance: true,
        totalEarnings: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Revendeur introuvable' }, { status: 404 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalWithdrawn = payouts
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingWithdrawn = payouts
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      walletBalance: parseFloat(tenant.walletBalance.toFixed(2)),
      totalEarnings: parseFloat(tenant.totalEarnings.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      pendingWithdrawn: parseFloat(pendingWithdrawn.toFixed(2)),
      payouts,
    });
  } catch (error: any) {
    console.error('Error fetching reseller payouts:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('reseller_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, paymentMethod, paymentDetails } = body;

    const requestedAmount = parseFloat(Number(amount).toFixed(2));
    if (isNaN(requestedAmount) || requestedAmount < 1) {
      return NextResponse.json(
        { success: false, message: 'Le montant minimum de retrait est de $1.00 USD.' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !String(paymentMethod).trim()) {
      return NextResponse.json(
        { success: false, message: 'Veuillez choisir un moyen de paiement pour votre retrait.' },
        { status: 400 }
      );
    }

    if (!paymentDetails || !String(paymentDetails).trim()) {
      return NextResponse.json(
        { success: false, message: 'Veuillez renseigner vos coordonnées de réception (Numéro ou Adresse Wallet).' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionToken },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Compte revendeur introuvable ou inactif.' },
        { status: 404 }
      );
    }

    if (tenant.walletBalance < requestedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Solde disponible insuffisant ($${tenant.walletBalance.toFixed(2)} USD). Vous avez demandé $${requestedAmount.toFixed(2)} USD.`,
        },
        { status: 400 }
      );
    }

    const reference = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deduct from walletBalance immediately to lock funds
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        walletBalance: { decrement: requestedAmount },
      },
    });

    const payout = await prisma.payoutRequest.create({
      data: {
        reference,
        tenantId: tenant.id,
        amount: requestedAmount,
        paymentMethod: String(paymentMethod).trim(),
        paymentDetails: String(paymentDetails).trim(),
        status: 'PENDING',
      },
    });

    // Notify Super Admin on Telegram
    sendTelegramNotification({
      title: `Demande de Retrait Revendeur — ${tenant.storeName || tenant.name}`,
      ticketCode: reference,
      type: 'REQUEST',
      amount: `$${requestedAmount.toFixed(2)} USD`,
      details: `Revendeur : ${tenant.name} (/store/${tenant.subdomain})\nMéthode : ${paymentMethod}\nCoordonnées : ${paymentDetails}\nSolde restant : $${updatedTenant.walletBalance.toFixed(2)} USD`,
    }).catch(console.error);

    // Notify Reseller on Telegram
    sendResellerTelegramNotification({
      tenantId: tenant.id,
      eventType: 'PAYOUT',
      title: `Demande de retrait enregistrée (${reference})`,
      ticketCode: reference,
      amount: `$${requestedAmount.toFixed(2)} USD`,
      details: `Votre demande de retrait de $${requestedAmount.toFixed(2)} USD via ${paymentMethod} (${paymentDetails}) a bien été transmise au Super Admin.\nNouveau solde disponible : $${updatedTenant.walletBalance.toFixed(2)} USD.`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      payout,
      newWalletBalance: parseFloat(updatedTenant.walletBalance.toFixed(2)),
      message: `Demande de retrait ${reference} de $${requestedAmount.toFixed(2)} USD envoyée avec succès !`,
    });
  } catch (error: any) {
    console.error('Error creating payout request:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
