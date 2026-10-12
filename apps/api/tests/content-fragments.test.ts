import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/app.js';
import { cookieFor, resetDb, send } from './helpers.js';

let admin: string;
let superAdmin: string;
let modelId: number;

const fields = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'subtitle', label: 'Subtitle', type: 'longText' },
  { key: 'body', label: 'Body', type: 'richText' },
  { key: 'image', label: 'Image', type: 'image' },
  { key: 'ctaUrl', label: 'Button link', type: 'link' },
  { key: 'postsPerPage', label: 'Posts per page', type: 'number' },
  { key: 'showButton', label: 'Show button', type: 'boolean' },
];

beforeEach(async () => {
  await resetDb();
  admin = await cookieFor('admin');
  superAdmin = await cookieFor('super_admin');
  const model = await (await send('POST', '/content-models', superAdmin, { key: 'banner', name: 'Banner', fields })).json();
  modelId = model.id;
});

const save = (key: string, data: object, model = 'banner') => send('PUT', `/content-fragments/${key}`, admin, { model, data });
const read = async (key: string) => (await app.request(`/content/${key}`)).json();

describe('saving fragments', () => {
  it('lets an admin save a fragment that anyone can read', async () => {
    expect((await save('home-banner', { title: 'Welcome', postsPerPage: 6, showButton: true })).status).toBe(201);

    const fragment = await read('home-banner');
    expect(fragment).toMatchObject({ key: 'home-banner', model: 'banner' });
    expect(fragment.data).toMatchObject({ title: 'Welcome', postsPerPage: 6, showButton: true });
  });

  it('fills optional fields with empty values', async () => {
    await save('home-banner', { title: 'Welcome' });
    const { data } = await read('home-banner');
    expect(data).toMatchObject({ subtitle: '', body: '', image: '', postsPerPage: null, showButton: false });
  });

  it('points at a missing required field', async () => {
    const res = await save('home-banner', { subtitle: 'No title' });
    expect(res.status).toBe(400);
    expect((await res.json()).details[0]).toMatchObject({ field: 'data.title', message: 'Title is required' });
  });

  it('checks value types', async () => {
    expect((await save('a', { title: 'X', postsPerPage: '6' })).status).toBe(400);
    expect((await save('b', { title: 'X', showButton: 'yes' })).status).toBe(400);
  });

  it('rejects unsafe links', async () => {
    expect((await save('a', { title: 'X', ctaUrl: 'javascript:alert(1)' })).status).toBe(400);
  });

  it('sanitizes rich text', async () => {
    const dirty = '<h2>Hi</h2><script>alert(1)</script><p onclick="steal()">Text <a href="javascript:x">link</a></p>';
    await save('home-banner', { title: 'X', body: dirty });

    const { data } = await read('home-banner');
    expect(data.body).toContain('<h2>Hi</h2>');
    expect(data.body).not.toContain('script');
    expect(data.body).not.toContain('onclick');
    expect(data.body).not.toContain('javascript');
  });

  it("won't switch a fragment to another model, or use an unknown one", async () => {
    await send('POST', '/content-models', superAdmin, {
      key: 'labels',
      name: 'Labels',
      fields: [{ key: 'readMore', label: 'Read more', type: 'text' }],
    });
    await save('home-banner', { title: 'Welcome' });

    expect((await save('home-banner', { readMore: 'More' }, 'labels')).status).toBe(409);
    expect((await save('other', { title: 'X' }, 'nope')).status).toBe(400);
  });
});

describe('reading fragments', () => {
  it('returns several fragments in one request, skipping missing keys', async () => {
    await save('home-banner', { title: 'Home' });
    await save('about-banner', { title: 'About' });

    const res = await app.request('/content?keys=home-banner,about-banner,missing-key');
    const body = await res.json();

    expect(Object.keys(body).sort()).toEqual(['about-banner', 'home-banner']);
    expect(body['home-banner'].data.title).toBe('Home');
  });

  it('returns 404 for an unknown key', async () => {
    expect((await app.request('/content/nothing-here')).status).toBe(404);
  });

  it('follows model changes: removed fields disappear, new fields appear empty', async () => {
    await save('home-banner', { title: 'Welcome', subtitle: 'Old field' });

    await send('PATCH', `/content-models/${modelId}`, superAdmin, {
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'tagline', label: 'Tagline', type: 'text' },
      ],
    });

    const { data } = await read('home-banner');
    expect(data).toEqual({ title: 'Welcome', tagline: '' });
  });
});

describe('protection', () => {
  it("won't delete a model that fragments use", async () => {
    await save('home-banner', { title: 'Welcome' });
    expect((await send('DELETE', `/content-models/${modelId}`, superAdmin)).status).toBe(409);
  });

  it('only lets super admins delete fragments', async () => {
    await save('home-banner', { title: 'Welcome' });
    expect((await send('DELETE', '/content-fragments/home-banner', admin)).status).toBe(403);
    expect((await send('DELETE', '/content-fragments/home-banner', superAdmin)).status).toBe(204);
  });
});