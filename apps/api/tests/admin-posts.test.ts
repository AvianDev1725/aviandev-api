import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app.js';
import { cookieFor, resetDb, send } from './helpers.js';

let admin: string;
let otherAdmin: string;
let superAdmin: string;

beforeEach(async () => {
  await resetDb();
  admin = await cookieFor('admin');
  otherAdmin = await cookieFor('admin', 'other@test.com');
  superAdmin = await cookieFor('super_admin');
});

const createPost = async (cookie: string, body: object) => (await send('POST', '/posts', cookie, body)).json();
const slugs = (items: { slug: string }[]) => items.map((item) => item.slug).sort();

describe('GET /admin/posts', () => {
  it("shows an admin their own drafts and published posts, but not other people's", async () => {
    await createPost(admin, { title: 'Draft', slug: 'my-draft' });
    await createPost(admin, { title: 'Live', slug: 'my-live', published: true });
    await createPost(otherAdmin, { title: 'Theirs', slug: 'their-draft' });

    const list = await (await send('GET', '/admin/posts', admin)).json();
    expect(slugs(list)).toEqual(['my-draft', 'my-live']);
  });

  it('shows a super admin every post', async () => {
    await createPost(admin, { title: 'A', slug: 'a' });
    await createPost(otherAdmin, { title: 'B', slug: 'b' });

    const list = await (await send('GET', '/admin/posts', superAdmin)).json();
    expect(slugs(list)).toEqual(['a', 'b']);
  });

  it('includes author and categories, but not the full content', async () => {
    const category = await (await send('POST', '/categories', admin, { name: 'GSAP', slug: 'gsap' })).json();
    await createPost(admin, { title: 'A', slug: 'a', categoryIds: [category.id] });

    const [post] = await (await send('GET', '/admin/posts', admin)).json();
    expect(post.authorName).toBe('Test User');
    expect(post.categories.map((c: { slug: string }) => c.slug)).toEqual(['gsap']);
    expect(post.content).toBeUndefined();
  });

  it('requires a login', async () => {
    expect((await app.request('/admin/posts')).status).toBe(401);
  });
});

describe('GET /admin/posts/:id', () => {
  it('returns a draft with its content to its author', async () => {
    const content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }] };
    const created = await createPost(admin, { title: 'Draft', slug: 'draft', content });

    const res = await send('GET', `/admin/posts/${created.id}`, admin);
    expect(res.status).toBe(200);
    const post = await res.json();
    expect(post.content).toEqual(content);
    expect(post.categories).toEqual([]);
  });

  it("blocks another admin, but not a super admin", async () => {
    const created = await createPost(admin, { title: 'Draft', slug: 'draft' });

    expect((await send('GET', `/admin/posts/${created.id}`, otherAdmin)).status).toBe(403);
    expect((await send('GET', `/admin/posts/${created.id}`, superAdmin)).status).toBe(200);
  });

  it('returns 404 for a missing post and 400 for a bad id', async () => {
    expect((await send('GET', '/admin/posts/999999', admin)).status).toBe(404);
    expect((await send('GET', '/admin/posts/abc', admin)).status).toBe(400);
  });
});