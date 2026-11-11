import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /_next (Next.js internal chunks, static files, and image optimization)
     * 2. Static files with extensions (.png, .jpg, .ico, .svg, .css, .js, .txt, .xml)
     */
    '/((?!_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
};

const ADMIN_SESSION_TOKEN = 'authenticated_admin_session_token_2026';

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const pathname = url.pathname;

  // --- 1. CRITICAL SECURITY GUARDS FOR API ROUTES ---
  if (pathname.startsWith('/api/admin/')) {
    // Allow /api/admin/auth and public GET /api/admin/marketing (for pixel & banner configs)
    if (
      pathname === '/api/admin/auth' ||
      (pathname === '/api/admin/marketing' && req.method === 'GET')
    ) {
      return NextResponse.next();
    }
    const token = req.cookies.get('admin_session')?.value;
    if (token !== ADMIN_SESSION_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé : Session Super Admin requise.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/suppliers') || pathname.startsWith('/api/saas/resellers') || pathname.startsWith('/api/user')) {
    const token = req.cookies.get('admin_session')?.value;
    if (token !== ADMIN_SESSION_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé : Session Super Admin requise.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (pathname === '/api/saas/plans' && req.method === 'PUT') {
    const token = req.cookies.get('admin_session')?.value;
    if (token !== ADMIN_SESSION_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé : Session Super Admin requise.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Pass through all other APIs directly without domain rewrites
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // --- 2. MULTI-TENANT DOMAIN ROUTING ---
  // Extract hostname without port (e.g. 'techstore.abonnementspro.com' or 'shop.maboutique.com')
  const hostname = host.split(':')[0].toLowerCase();

  // Root platform domains and technical hosts
  const isPlatformHost =
    hostname === 'abonnementspro.com' ||
    hostname === 'www.abonnementspro.com' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.up.railway.app') ||
    hostname.endsWith('.vercel.app');

  let tenantKey: string | null = null;

  if (hostname.endsWith('.abonnementspro.com')) {
    const candidate = hostname.replace('.abonnementspro.com', '').trim();
    if (candidate && candidate !== 'www' && candidate !== 'app' && candidate !== 'admin') {
      tenantKey = candidate;
    }
  } else if (hostname.endsWith('.localhost')) {
    const candidate = hostname.replace('.localhost', '').trim();
    if (candidate && candidate !== 'www') {
      tenantKey = candidate;
    }
  } else if (!isPlatformHost) {
    // Custom domain scenario (e.g. 'shop.maboutique.com' or 'digitaldeals.net')
    // Prevent SSRF / internal IP loopbacks (e.g., 127.0.0.1, 10.x, 192.168.x)
    const isValidDomainFormat = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(hostname);
    const isPrivateIp = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)/.test(hostname);
    if (isValidDomainFormat && !isPrivateIp) {
      tenantKey = hostname;
    }
  }

  // If a valid reseller subdomain OR custom domain is visited:
  if (tenantKey) {
    // Platform routes (reseller dashboard, login, admin, etc.) should never be rewritten to /store/...
    if (pathname.startsWith('/reseller') || pathname.startsWith('/fatjo&prudo')) {
      return NextResponse.next();
    }

    // If accessing root '/' on tenant domain, rewrite internally to '/store/[subdomain]'
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/store/${tenantKey}`, req.url));
    }

    // If already targeting /store/, let it proceed
    if (pathname.startsWith('/store/')) {
      return NextResponse.next();
    }

    // Rewrite any subpath on the tenant domain (e.g. '/p/slug', '/otp', etc.)
    return NextResponse.rewrite(new URL(`/store/${tenantKey}${pathname}`, req.url));
  }

  return NextResponse.next();
}
