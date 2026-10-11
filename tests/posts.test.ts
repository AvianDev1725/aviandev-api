import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app.js';
import { db } from '../src/db/index.js';
import { posts } from '../src/db/schema.js';

function createPost(body: object) {
    return app.request('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

beforeEach(async () => {
    await db.delete(posts);
});

describe('POST /posts', () => {
    it('creates a post', async () => {
        const res = await createPost({ title: 'Test', slug: 'test', published: true });
        expect(res.status).toBe(201);

        const rows = await db.select().from(posts);
        expect(rows).toHaveLength(1);
        expect(rows[0].slug).toBe('test');
    });
});

describe('GET /posts', () => {
    it('lists only published posts', async () => {
        await createPost({ title: 'Live', slug: 'live', published: true });
        await createPost({ title: 'Draft', slug: 'draft', published: false });

        const res = await app.request('/posts');
        const list = await res.json();

        expect(list).toHaveLength(1);
        expect(list[0].slug).toBe('live');
    });
});

describe('GET /posts/:slug', () => {
    it('returns a published post', async () => {
        await createPost({ title: 'Live', slug: 'live', published: true });
        const res = await app.request('/posts/live');
        expect(res.status).toBe(200);
    });

    it('returns 404 for a draft', async () => {
        await createPost({ title: 'Draft', slug: 'draft', published: false });
        const res = await app.request('/posts/draft');
        expect(res.status).toBe(404);
    });
});

describe('PATCH /posts/:id', () => {
    it('updates the title', async () => {
        const created = await (await createPost({ title: 'Old', slug: 'old', published: true })).json();

        const res = await app.request(`/posts/${created.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'New' }),
        });

        expect(res.status).toBe(200);
        expect((await res.json()).title).toBe('New');
    });
});

describe('DELETE /posts/:id', () => {
    it('deletes a post, then returns 404', async () => {
        const created = await (await createPost({ title: 'Bye', slug: 'bye', published: true })).json();

        const first = await app.request(`/posts/${created.id}`, { method: 'DELETE' });
        expect(first.status).toBe(204);

        const second = await app.request(`/posts/${created.id}`, { method: 'DELETE' });
        expect(second.status).toBe(404);
    });

    it('returns 400 for an invalid id', async () => {
        const res = await app.request('/posts/abc', { method: 'DELETE' });
        expect(res.status).toBe(400);
    });
});