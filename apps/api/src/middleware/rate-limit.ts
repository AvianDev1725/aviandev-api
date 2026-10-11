import { createMiddleware } from 'hono/factory';

export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return createMiddleware(async (c, next) => {
    if (process.env.NODE_ENV === 'test') return next();

    const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.resetAt < now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (++entry.count > max) {
      return c.json({ error: 'Too many requests. Try again later.' }, 429);
    }
    await next();
  });
}