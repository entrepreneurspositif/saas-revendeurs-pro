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
  const host = req.headers.get('host') || '';
  const pathname = url.pathname;

  // Extract hostname without port (e.g. 'techstore.abonnementspro.com' or 'techstore.localhost')
  const hostname = host.split(':')[0].toLowerCase();

  // Detect reseller subdomains (excluding root domain and technical subdomains like www)
  let subdomain: string | null = null;

  if (hostname.endsWith('.abonnementspro.com')) {
    const candidate = hostname.replace('.abonnementspro.com', '').trim();
    if (candidate && candidate !== 'www' && candidate !== 'app' && candidate !== 'admin') {
      subdomain = candidate;
    }
  } else if (hostname.endsWith('.localhost')) {
    const candidate = hostname.replace('.localhost', '').trim();
    if (candidate && candidate !== 'www') {
      subdomain = candidate;
    }
  }

  // If a valid reseller subdomain is visited:
  if (subdomain) {
    // If accessing root '/' on subdomain, rewrite internally to '/store/[subdomain]'
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/store/${subdomain}`, req.url));
    }

    // If already targeting /store/, let it proceed
    if (pathname.startsWith('/store/')) {
      return NextResponse.next();
    }

    // Rewrite any subpath on the subdomain (e.g. '/otp' or any future store subpages)
    return NextResponse.rewrite(new URL(`/store/${subdomain}${pathname}`, req.url));
  }

  return NextResponse.next();
}
