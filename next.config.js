/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: [
      '@libsql/client',
      '@prisma/adapter-libsql',
      '@prisma/client',
    ],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|png|jpg|jpeg|ico|webp|webmanifest)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
