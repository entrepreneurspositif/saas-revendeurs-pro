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
const DEFAULT_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5NjA3NTksImlkIjoiMDFhMGZkM2EtYTUwMS03YmY2LTliMmYtZDQzMTAzY2YwMjM1Iiwia2lkIjoia3lETFZaaENEZkVxeWs0OXlkX1FaYzNPMm5PVjB6TEpmeEFFN29HZ3dnMCIsInJpZCI6ImI4NDIyMDE3LTE4NWEtNDc4OS1iNGRjLTY0Y2Q4ZGZhMGQ0MiJ9._ZHMYECGHRN_MQkceyHc60wR06pmOMJlmtDqhOXL4yM6-rXLiwKX23dWQ7Y3GP2WppU6xutHGDSPgz3PmGBPDQ";

function createPrismaClient(): PrismaClient {
  let tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || DEFAULT_TURSO_URL;
  let tursoToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;

  if (!tursoUrl || tursoUrl.includes('[SENSITIVE]') || !tursoUrl.includes('://')) {
    tursoUrl = DEFAULT_TURSO_URL;
  }
  if (!tursoToken || tursoToken.includes('[SENSITIVE]')) {
    tursoToken = DEFAULT_TURSO_TOKEN;
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
