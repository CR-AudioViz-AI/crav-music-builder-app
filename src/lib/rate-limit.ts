export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxConcurrentJobs: number;
  maxPreviewsPerDay: number;
}

export const RATE_LIMITS: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60 * 1000,
  maxConcurrentJobs: 3,
  maxPreviewsPerDay: 30,
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requestLimits = new Map<string, RateLimitEntry>();
const previewCounts = new Map<string, { count: number; date: string }>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = `req:${identifier}`;

  let entry = requestLimits.get(key);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + RATE_LIMITS.windowMs,
    };
    requestLimits.set(key, entry);
  }

  const allowed = entry.count < RATE_LIMITS.maxRequests;

  if (allowed) {
    entry.count++;
  }

  return {
    allowed,
    remaining: Math.max(0, RATE_LIMITS.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

export function checkPreviewQuota(userId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: string;
} {
  const today = new Date().toISOString().split('T')[0];
  const key = `preview:${userId}`;

  let entry = previewCounts.get(key);

  if (!entry || entry.date !== today) {
    entry = { count: 0, date: today };
    previewCounts.set(key, entry);
  }

  const allowed = entry.count < RATE_LIMITS.maxPreviewsPerDay;

  if (allowed) {
    entry.count++;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    allowed,
    remaining: Math.max(0, RATE_LIMITS.maxPreviewsPerDay - entry.count),
    resetAt: tomorrow.toISOString(),
  };
}

export function getConcurrentJobCount(userId: string): Promise<number> {
  return Promise.resolve(0);
}

export async function checkConcurrentJobs(userId: string): Promise<boolean> {
  const count = await getConcurrentJobCount(userId);
  return count < RATE_LIMITS.maxConcurrentJobs;
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of requestLimits.entries()) {
    if (entry.resetAt < now) {
      requestLimits.delete(key);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  for (const [key, entry] of previewCounts.entries()) {
    if (entry.date !== today) {
      previewCounts.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000);
