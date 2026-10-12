import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app.js';
import { cookieFor, resetDb, send } from './helpers.js';

let admin: string;
let superAdmin: string;

beforeEach(async () => {
  await resetDb();
  admin = await cookieFor('admin');
  superAdmin = await cookieFor('super_admin');
});

const createCategory = async (name: string, slug: string) =>
  (await send('POST', '/categories', admin, { name, slug })).json();

const createPost = async (body: object) => (await send('POST', '/posts', admin, body)).json();

const slugs = (items: { slug: string }[]) => items.map((item) => item.slug).sort();

describe('categories', () => {
  it('lets admins create categories and anyone list them', async () => {
    const res = await send('POST', '/categories', admin, { name: 'Next.js', slug: 'nextjs' });
    expect(res.status).toBe(201);

    const list = await (await app.request('/categories')).json();
    expect(slugs(list)).toEqual(['nextjs']);
  });

  it('rejects a duplicate slug', async () => {
    await createCategory('Next.js', 'nextjs');
    const res = await send('POST', '/categories', admin, { name: 'Next', slug: 'nextjs' });
    expect(res.status).toBe(409);
  });

  it('only lets super admins delete', async () => {
    const category = await createCategory('GSAP', 'gsap');
    expect((await send('DELETE', `/categories/${category.id}`, admin)).status).toBe(403);
    expect((await send('DELETE', `/categories/${category.id}`, superAdmin)).status).toBe(204);
  });
});

describe('posts with categories', () => {
  it('saves several categories on one post', async () => {
    const nextjs = await createCategory('Next.js', 'nextjs');
    const perf = await createCategory('Performance', 'performance');

    const post = await createPost({ title: 'Fast', slug: 'fast', published: true, categoryIds: [nextjs.id, perf.id] });
    expect(slugs(post.categories)).toEqual(['nextjs', 'performance']);
  });

  it('filters published posts by category', async () => {
    const nextjs = await createCategory('Next.js', 'nextjs');
    const gsap = await createCategory('GSAP', 'gsap');
    await createPost({ title: 'A', slug: 'a', published: true, categoryIds: [nextjs.id] });
    await createPost({ title: 'B', slug: 'b', published: true, categoryIds: [gsap.id] });
    await createPost({ title: 'C', slug: 'c', published: true, categoryIds: [nextjs.id, gsap.id] });

    const list = await (await app.request('/posts?category=nextjs')).json();
    expect(slugs(list)).toEqual(['a', 'c']);
  });

  it('replaces categories on update', async () => {
    const nextjs = await createCategory('Next.js', 'nextjs');
    const gsap = await createCategory('GSAP', 'gsap');
    const post = await createPost({ title: 'A', slug: 'a', categoryIds: [nextjs.id] });

    const updated = await (await send('PATCH', `/posts/${post.id}`, admin, { categoryIds: [gsap.id] })).json();
    expect(slugs(updated.categories)).toEqual(['gsap']);
  });

  it('rejects unknown category ids', async () => {
    const res = await send('POST', '/posts', admin, { title: 'A', slug: 'a', categoryIds: [999999] });
    expect(res.status).toBe(400);
  });

  it('keeps posts when their category is deleted', async () => {
    const nextjs = await createCategory('Next.js', 'nextjs');
    await createPost({ title: 'A', slug: 'a', published: true, categoryIds: [nextjs.id] });

    await send('DELETE', `/categories/${nextjs.id}`, superAdmin);

    const list = await (await app.request('/posts')).json();
    expect(list).toHaveLength(1);
    expect(list[0].categories).toEqual([]);
  });
});