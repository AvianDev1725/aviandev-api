import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/db/index.js';
import { invitations } from '../src/db/schema.js';
import { cookieFor, createUser, resetDb, send, PASSWORD } from './helpers.js';

let superAdmin: string;

beforeEach(async () => {
  await resetDb();
  superAdmin = await cookieFor('super_admin');
});

async function invite(email = 'guest@test.com', role = 'admin') {
  const res = await send('POST', '/invitations', superAdmin, { email, role });
  const body = await res.json();
  return { res, token: body.inviteUrl ? new URL(body.inviteUrl).searchParams.get('token')! : '' };
}

const accept = (token: string) =>
  send('POST', '/invitations/accept', undefined, { token, name: 'Guest Writer', password: PASSWORD });

const loginGuest = () =>
  send('POST', '/auth/login', undefined, { email: 'guest@test.com', password: PASSWORD });

describe('POST /invitations', () => {
  it('lets a super admin invite someone', async () => {
    const { res, token } = await invite();
    expect(res.status).toBe(201);
    expect(token).not.toBe('');
  });

  it('blocks admins from inviting', async () => {
    const admin = await cookieFor('admin');
    const res = await send('POST', '/invitations', admin, { email: 'x@test.com', role: 'admin' });
    expect(res.status).toBe(403);
  });

  it('refuses to invite an existing user', async () => {
    await createUser('taken@test.com');
    const { res } = await invite('taken@test.com');
    expect(res.status).toBe(409);
  });
});

describe('POST /invitations/accept', () => {
  it('creates an active account with the invited role', async () => {
    const { token } = await invite('guest@test.com', 'super_admin');
    const res = await accept(token);

    expect(res.status).toBe(201);
    expect((await res.json()).user.role).toBe('super_admin');
    expect((await loginGuest()).status).toBe(200);
  });

  it('only works once', async () => {
    const { token } = await invite();
    await accept(token);
    expect((await accept(token)).status).toBe(400);
  });

  it('rejects a made-up token', async () => {
    expect((await accept('not-a-real-token')).status).toBe(400);
  });

  it('rejects an expired invite', async () => {
    const { token } = await invite();
    await db.update(invitations).set({ expiresAt: new Date(Date.now() - 1000) });

    expect((await accept(token)).status).toBe(400);
    expect((await loginGuest()).status).toBe(401);
  });
});