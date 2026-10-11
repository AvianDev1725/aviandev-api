import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { posts, users } from '../src/db/schema.js';
import { cookieFor, send, PASSWORD } from './helpers.js';

const applicant = { name: 'New Admin', email: 'new@test.com', password: PASSWORD };
const signup = (body: object = applicant) => send('POST', '/auth/signup', undefined, body);
const tryLogin = () => send('POST', '/auth/login', undefined, { email: applicant.email, password: PASSWORD });

let superAdmin: string;

beforeEach(async () => {
  await db.delete(posts);
  await db.delete(users);
  superAdmin = await cookieFor('super_admin');
});

async function pendingId() {
  await signup();
  const list = await (await send('GET', '/users/pending', superAdmin)).json();
  return list[0].id;
}

describe('POST /auth/signup', () => {
  it('creates a pending request that cannot log in yet', async () => {
    expect((await signup()).status).toBe(202);

    const [row] = await db.select().from(users).where(eq(users.email, applicant.email));
    expect(row.status).toBe('pending');
    expect(row.passwordHash).not.toBe(PASSWORD);
    expect((await tryLogin()).status).toBe(401);
  });

  it('gives the same answer for an email that already exists', async () => {
    await signup();
    expect((await signup()).status).toBe(202);

    const rows = await db.select().from(users).where(eq(users.email, applicant.email));
    expect(rows).toHaveLength(1);
  });

  it('rejects a short password', async () => {
    expect((await signup({ ...applicant, password: 'short' })).status).toBe(400);
  });
});

describe('reviewing requests', () => {
  it('lists pending requests without password hashes', async () => {
    await signup();
    const list = await (await send('GET', '/users/pending', superAdmin)).json();

    expect(list).toHaveLength(1);
    expect(list[0].email).toBe(applicant.email);
    expect(list[0].passwordHash).toBeUndefined();
  });

  it('approving lets the user log in', async () => {
    const id = await pendingId();
    expect((await send('POST', `/users/${id}/approve`, superAdmin)).status).toBe(200);
    expect((await tryLogin()).status).toBe(200);
  });

  it('rejecting keeps the user locked out', async () => {
    const id = await pendingId();
    expect((await send('POST', `/users/${id}/reject`, superAdmin)).status).toBe(200);
    expect((await tryLogin()).status).toBe(401);
  });

  it('cannot review the same request twice', async () => {
    const id = await pendingId();
    await send('POST', `/users/${id}/approve`, superAdmin);
    expect((await send('POST', `/users/${id}/reject`, superAdmin)).status).toBe(404);
  });

  it('blocks admins and logged-out users', async () => {
    const admin = await cookieFor('admin');
    expect((await send('GET', '/users/pending', admin)).status).toBe(403);
    expect((await send('GET', '/users/pending')).status).toBe(401);
  });
});