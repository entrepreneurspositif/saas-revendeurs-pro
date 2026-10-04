import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = String(body.path || '/').trim();
    const rawReferrer = String(body.referrer || req.headers.get('referer') || '').trim();

    // Ignore admin dashboard routes from visit statistics
    if (path.startsWith('/fatjo&prudo') || path.startsWith('/api')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

    // Hash IP address for privacy
    const ipHash = crypto.createHash('sha256').update(`${ip}-${userAgent.substring(0, 50)}`).digest('hex').substring(0, 16);

    // Detect basic device type from User-Agent
    let device = 'desktop';
    const ua = userAgent.toLowerCase();
    if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
      device = 'mobile';
    } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
      device = 'tablet';
    }

    // Clean referrer domain
    let referrer = 'Direct / Recherche';
    if (rawReferrer && !rawReferrer.includes(req.headers.get('host') || '')) {
      try {
        const urlObj = new URL(rawReferrer);
        referrer = urlObj.hostname.replace('www.', '');
      } catch (e) {
        referrer = rawReferrer.substring(0, 50);
      }
    }

    await prisma.visitLog.create({
      data: {
        path,
        userAgent: userAgent.substring(0, 200),
        ipHash,
        referrer,
        device,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
