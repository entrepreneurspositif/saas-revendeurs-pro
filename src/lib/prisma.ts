import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
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

const DEFAULT_TURSO_URL = "libsql://revente-db-entrepreneurspositifs.aws-eu-west-1.turso.io";
const DEFAULT_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;

  // 1. If Turso Cloud DB credentials are available, use LibSQL Adapter
  if (tursoUrl && tursoToken) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // 2. Fallback local / Vercel /tmp SQLite
  let dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const candidatePaths = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
          path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
          '/var/task/prisma/dev.db',
          '/var/task/dev.db',
        ];

        let copied = false;
        for (const src of candidatePaths) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
            copied = true;
            break;
          }
        }

        if (!copied) {
          fs.writeFileSync(tmpDbPath, '');
        }
      }
      dbUrl = `file:${tmpDbPath}`;
    } catch (err) {
      console.error('Error preparing Vercel /tmp SQLite db:', err);
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
