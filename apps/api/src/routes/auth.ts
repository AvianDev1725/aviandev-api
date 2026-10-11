import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { createSession, getSessionUser, deleteSession, SESSION_COOKIE } from '../lib/session.js';
import { validateJson } from '../lib/validate.js';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const dummyHash = await hashPassword('dummy-password-for-timing');

const auth = new Hono();

auth.post('/login', validateJson(loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const [user] = await db.select().from(users).where(eq(users.email, email));

  const passwordOk = await verifyPassword(user?.passwordHash ?? dummyHash, password);
  if (!user || !passwordOk || user.status !== 'active') {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const { token, expiresAt } = await createSession(user.id);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  });

  return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

auth.get('/me', async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  const user = token ? await getSessionUser(token) : null;
  if (!user) return c.json({ error: 'Not logged in' }, 401);
  return c.json({ user });
});

auth.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await deleteSession(token);
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.body(null, 204);
});

export default auth;