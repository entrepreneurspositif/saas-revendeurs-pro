import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes (leave untouched for direct API access)
     * 2. /_next (Next.js internal chunks, static files, and image optimization)
     * 3. Static files with extensions (.png, .jpg, .ico, .svg, .css, .js, .txt, .xml)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const pathname = url.pathname;

  // Extract hostname without port (e.g. 'techstore.abonnementspro.com' or 'techstore.localhost' or 'shop.maboutique.com')
  const hostname = host.split(':')[0].toLowerCase();

  // Root platform domains and technical hosts
  const isPlatformHost =
    hostname === 'abonnementspro.com' ||
    hostname === 'www.abonnementspro.com' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.up.railway.app');

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
    tenantKey = hostname;
  }

  // If a valid reseller subdomain OR custom domain is visited:
  if (tenantKey) {
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
