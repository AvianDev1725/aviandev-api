import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { posts } from '../src/db/schema.js';
import { cookieFor, createUser, loginAs, resetDb, send, PASSWORD } from './helpers.js';

let superAdmin: string;

beforeEach(async () => {
  await resetDb();
  superAdmin = await cookieFor('super_admin');
});

describe('GET /users', () => {
  it('lists active members only, without password hashes', async () => {
    await createUser('admin@test.com', 'admin');
    await createUser('pending@test.com', 'admin', 'pending');

    const list = await (await send('GET', '/users', superAdmin)).json();
    const emails = list.map((u: { email: string }) => u.email);

    expect(emails).toContain('admin@test.com');
    expect(emails).not.toContain('pending@test.com');
    expect(list[0].passwordHash).toBeUndefined();
  });

  it('is blocked for admins', async () => {
    const admin = await cookieFor('admin');
    expect((await send('GET', '/users', admin)).status).toBe(403);
  });
});

describe('DELETE /users/:id', () => {
  it('deletes a user, logs them out, and deletes their posts', async () => {
    const user = await createUser('writer@test.com', 'admin');
    const cookie = await loginAs('writer@test.com');
    await send('POST', '/posts', cookie, { title: 'Theirs', slug: 'theirs' });

    expect((await send('DELETE', `/users/${user.id}`, superAdmin)).status).toBe(204);

    expect((await send('GET', '/auth/me', cookie)).status).toBe(401);
    const login = await send('POST', '/auth/login', undefined, { email: 'writer@test.com', password: PASSWORD });
    expect(login.status).toBe(401);

    const remaining = await db.select().from(posts).where(eq(posts.slug, 'theirs'));
    expect(remaining).toHaveLength(0);
  });

  it('can delete a super admin who has sent invites', async () => {
    const other = await createUser('other@test.com', 'super_admin');
    const otherCookie = await loginAs('other@test.com');
    await send('POST', '/invitations', otherCookie, { email: 'guest@test.com', role: 'admin' });

    expect((await send('DELETE', `/users/${other.id}`, superAdmin)).status).toBe(204);
  });

  it("won't let you delete yourself", async () => {
    const me = await (await send('GET', '/auth/me', superAdmin)).json();
    expect((await send('DELETE', `/users/${me.user.id}`, superAdmin)).status).toBe(400);
  });

  it('returns 404 for an unknown user, and 403 for admins', async () => {
    expect((await send('DELETE', '/users/999999', superAdmin)).status).toBe(404);

    const admin = await cookieFor('admin');
    const target = await createUser('target@test.com', 'admin');
    expect((await send('DELETE', `/users/${target.id}`, admin)).status).toBe(403);
  });

  it('can delete a super admin who has reviewed requests', async () => {
    const reviewer = await createUser('reviewer@test.com', 'super_admin');
    const reviewerCookie = await loginAs('reviewer@test.com');

    await send('POST', '/auth/signup', undefined, { name: 'Applicant', email: 'applicant@test.com', password: PASSWORD });
    const [request] = await (await send('GET', '/users/pending', reviewerCookie)).json();
    await send('POST', `/users/${request.id}/approve`, reviewerCookie);

    expect((await send('DELETE', `/users/${reviewer.id}`, superAdmin)).status).toBe(204);
  });
});