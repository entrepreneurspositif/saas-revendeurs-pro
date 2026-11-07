import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import { isMaliciousPayload, sanitizeText, sanitizeMultilineText } from '@/lib/sanitizer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    const tickets = await prisma.resellerTicket.findMany({
      where: { tenantId: tenant.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'OPEN').length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
      closed: tickets.filter((t) => t.status === 'CLOSED').length,
    };

    return NextResponse.json({
      success: true,
      tickets,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching reseller tickets:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { subject, category = 'GENERAL', priority = 'MEDIUM', message } = body;

    if (isMaliciousPayload(subject) || isMaliciousPayload(message)) {
      return NextResponse.json(
        { success: false, message: 'Requête rejetée : contenu non autorisé ou script détecté.' },
        { status: 400 }
      );
    }

    const cleanSubject = sanitizeText(subject, 150);
    const cleanMessage = sanitizeMultilineText(message, 3000);

    if (!cleanSubject) {
      return NextResponse.json({ success: false, message: 'Le sujet est requis' }, { status: 400 });
    }

    if (!cleanMessage) {
      return NextResponse.json({ success: false, message: 'Le message initial est requis' }, { status: 400 });
    }

    const allowedCategories = ['GENERAL', 'TECHNICAL', 'BILLING', 'SUPPLIER', 'OTHER'];
    const cleanCategory = allowedCategories.includes(String(category).toUpperCase()) ? String(category).toUpperCase() : 'GENERAL';

    const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const cleanPriority = allowedPriorities.includes(String(priority).toUpperCase()) ? String(priority).toUpperCase() : 'MEDIUM';

    // Generate unique human-readable ticket code: TKT-RES-XXXXX
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ticketCode = `TKT-RES-${randomSuffix}`;

    const newTicket = await prisma.resellerTicket.create({
      data: {
        ticketCode,
        tenantId: tenant.id,
        subject: cleanSubject,
        category: cleanCategory,
        priority: cleanPriority,
        status: 'OPEN',
        messages: {
          create: {
            senderRole: 'RESELLER',
            senderName: sanitizeText(tenant.storeName || tenant.name || 'Revendeur', 80),
            message: cleanMessage,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // Notify Super Admin on Telegram
    sendTelegramNotification({
      title: `Nouveau Ticket Support Revendeur (${ticketCode})`,
      ticketCode: ticketCode,
      type: 'SUPPORT',
      details: `Revendeur : ${tenant.name} (${tenant.storeName || tenant.subdomain})\nSujet : ${cleanSubject}\nPriorité : ${cleanPriority}\nMessage :\n${cleanMessage.substring(0, 300)}`,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Ticket créé avec succès. Le Super Admin a été notifié.',
    });
  } catch (error: any) {
    console.error('Error creating reseller ticket:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
