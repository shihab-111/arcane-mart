// Small in-memory limiter. Fine for a single-instance deploy.
// On multi-instance hosting, swap the Map for Redis/Upstash.
const buckets = new Map();

export function rateLimit(key, opts = {}) {
  const limit = opts.limit ?? 5;
  const windowMs = opts.windowMs ?? 60000;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  b.count += 1;
  return { allowed: b.count <= limit, remaining: Math.max(0, limit - b.count) };
}

export function clientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
