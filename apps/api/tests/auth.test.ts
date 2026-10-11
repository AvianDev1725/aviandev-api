import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app.js';
import { db } from '../src/db/index.js';
import { posts, users } from '../src/db/schema.js';
import { hashPassword } from '../src/lib/password.js';

const PASSWORD = 'test-password-123';

async function createUser(email: string, status: 'active' | 'pending' = 'active') {
  await db.insert(users).values({
    name: 'Test User',
    email,
    passwordHash: await hashPassword(PASSWORD),
    role: 'admin',
    status,
  });
}

function login(email: string, password: string) {
  return app.request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

function sessionCookie(res: Response) {
  return res.headers.get('set-cookie')!.split(';')[0];
}

beforeEach(async () => {
  await db.delete(posts);
  await db.delete(users);
});

describe('POST /auth/login', () => {
  it('logs in an active user and sets an httpOnly cookie', async () => {
    await createUser('admin@test.com');
    const res = await login('admin@test.com', PASSWORD);

    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
    expect((await res.json()).user.email).toBe('admin@test.com');
  });

  it('rejects a wrong password', async () => {
    await createUser('admin@test.com');
    const res = await login('admin@test.com', 'wrong-password');
    expect(res.status).toBe(401);
  });

  it('gives the same error for an unknown email', async () => {
    const res = await login('nobody@test.com', PASSWORD);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Invalid email or password');
  });

  it('rejects a pending user', async () => {
    await createUser('pending@test.com', 'pending');
    const res = await login('pending@test.com', PASSWORD);
    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me and POST /auth/logout', () => {
  it('returns the user while logged in, then 401 after logout', async () => {
    await createUser('admin@test.com');
    const cookie = sessionCookie(await login('admin@test.com', PASSWORD));

    const me = await app.request('/auth/me', { headers: { Cookie: cookie } });
    expect(me.status).toBe(200);
    expect((await me.json()).user.email).toBe('admin@test.com');

    const logout = await app.request('/auth/logout', { method: 'POST', headers: { Cookie: cookie } });
    expect(logout.status).toBe(204);

    const after = await app.request('/auth/me', { headers: { Cookie: cookie } });
    expect(after.status).toBe(401);
  });

  it('returns 401 without a cookie', async () => {
    const res = await app.request('/auth/me');
    expect(res.status).toBe(401);
  });
});