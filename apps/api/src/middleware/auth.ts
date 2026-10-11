import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { getSessionUser, SESSION_COOKIE } from '../lib/session.js';

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
export type AuthEnv = { Variables: { user: SessionUser } };

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  const user = token ? await getSessionUser(token) : null;
  if (!user) return c.json({ error: 'Not logged in' }, 401);
  c.set('user', user);
  await next();
});

export const requireRole = (...roles: SessionUser['role'][]) =>
  createMiddleware<AuthEnv>(async (c, next) => {
    if (!roles.includes(c.get('user').role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    await next();
  });