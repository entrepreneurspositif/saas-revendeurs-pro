import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import dns from 'dns';

// Fix Node.js DNS resolution order on Windows for external APIs like canboso.com
if (typeof window === 'undefined') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    // Ignore if already set or in edge runtime
  }
}

const DEFAULT_TURSO_URL = "https://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";

function createPrismaClient(): PrismaClient {
  let tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || DEFAULT_TURSO_URL;
  let tursoToken = process.env.TURSO_AUTH_TOKEN || "";

  if (!tursoUrl || tursoUrl.includes('[SENSITIVE]') || !tursoUrl.includes('://')) {
    tursoUrl = DEFAULT_TURSO_URL;
  }
  if (!tursoToken || tursoToken.includes('[SENSITIVE]')) {
    tursoToken = process.env.TURSO_AUTH_TOKEN || "";
  }

  if (tursoUrl.startsWith('libsql://')) {
    tursoUrl = tursoUrl.replace('libsql://', 'https://');
  }

  // Use LibSQL adapter unconditionally for Turso cloud DB
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
