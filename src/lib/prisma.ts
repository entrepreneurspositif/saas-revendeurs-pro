import { PrismaClient } from '@prisma/client';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

// Fix Node.js DNS resolution order on Windows for external APIs like canboso.com
if (typeof window === 'undefined') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    // Ignore if already set or in edge runtime
  }
}

function getDatabaseUrl(): string | undefined {
  if (typeof window !== 'undefined') return undefined;

  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        }
      }
      return `file:${tmpDbPath}`;
    } catch (err) {
      console.error('Error preparing Vercel /tmp SQLite db:', err);
    }
  }

  return process.env.DATABASE_URL || 'file:./prisma/dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    dbUrl
      ? {
          datasources: {
            db: {
              url: dbUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
