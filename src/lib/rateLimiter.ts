/**
 * In-memory IP-based Rate Limiter & Brute-force Shield.
 * Prevents enumeration of ticket codes, password guessing, and rapid-fire API flooding.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  failures: number;
  lockedUntil: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now && entry.lockedUntil < now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extracts client IP from request headers.
 */
export function getClientIp(req: Request | any): string {
  const forwarded = req.headers?.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  const realIp = req.headers?.get?.('x-real-ip') || req.headers?.['x-real-ip'];
  if (realIp) {
    return String(realIp).trim();
  }
  return '127.0.0.1';
}

/**
 * Checks whether the client is within rate limits.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key) || {
    count: 0,
    resetAt: now + windowMs,
    failures: 0,
    lockedUntil: 0,
  };

  if (entry.lockedUntil > now) {
    return { allowed: false, remaining: 0 };
  }

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  memoryStore.set(key, entry);

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Records a failed lookup/probe (e.g. 404 ticket not found).
 * Locks the IP if consecutive failures exceed maxFailures.
 */
export function recordFailure(
  key: string,
  maxFailures: number = 10,
  lockoutMs: number = 5 * 60 * 1000
): { locked: boolean } {
  const now = Date.now();
  const entry = memoryStore.get(key) || {
    count: 0,
    resetAt: now + 60000,
    failures: 0,
    lockedUntil: 0,
  };

  entry.failures += 1;
  if (entry.failures >= maxFailures) {
    entry.lockedUntil = now + lockoutMs;
    memoryStore.set(key, entry);
    return { locked: true };
  }

  memoryStore.set(key, entry);
  return { locked: false };
}
