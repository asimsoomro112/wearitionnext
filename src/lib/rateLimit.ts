// WEARITION — In-memory per-key rate limiter for API routes.
//
// Deliberately dependency-free and pure (testable with node:test).
// Vercel serverless caveat: state lives per function instance, so this is
// best-effort throttling on warm instances — it still makes brute force
// expensive, but a durable store (e.g. Upstash Redis) is the production
// follow-up for strict cross-instance limits.
type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_BUCKETS = 10000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();

  // Bound memory: prune expired buckets once the map gets large.
  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }

  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: Math.max(0, entry.resetAt - now) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** Best-effort client IP behind Vercel's proxy (first x-forwarded-for hop). */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
