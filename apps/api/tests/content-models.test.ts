import { describe, it, expect, beforeEach } from 'vitest';
import { cookieFor, resetDb, send } from './helpers.js';

let admin: string;
let superAdmin: string;

beforeEach(async () => {
  await resetDb();
  admin = await cookieFor('admin');
  superAdmin = await cookieFor('super_admin');
});

const bannerModel = {
  key: 'banner',
  name: 'Banner',
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtitle', type: 'longText' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'showButton', label: 'Show button', type: 'boolean' },
  ],
};

const createModel = (body: object, cookie = superAdmin) => send('POST', '/content-models', cookie, body);

describe('field types', () => {
  it('lists the palette for admins', async () => {
    const types = await (await send('GET', '/content-models/field-types', admin)).json();
    expect(Object.keys(types)).toEqual(
      expect.arrayContaining(['text', 'longText', 'number', 'richText', 'image', 'link', 'boolean'])
    );
  });
});

describe('content models', () => {
  it('lets a super admin create a model, keeping field order and filling defaults', async () => {
    const res = await createModel(bannerModel);
    expect(res.status).toBe(201);

    const model = await res.json();
    expect(model.fields.map((f: { key: string }) => f.key)).toEqual(['title', 'subtitle', 'image', 'showButton']);
    expect(model.fields[1]).toMatchObject({ required: false, help: '' });
  });

  it('blocks admins from creating models', async () => {
    expect((await createModel(bannerModel, admin)).status).toBe(403);
  });

  it('rejects duplicate field keys', async () => {
    const res = await createModel({
      ...bannerModel,
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'title', label: 'Again', type: 'text' },
      ],
    });
    expect(res.status).toBe(400);
  });

  it('rejects unknown field types and badly named keys', async () => {
    const badType = await createModel({ ...bannerModel, fields: [{ key: 'title', label: 'Title', type: 'video' }] });
    expect(badType.status).toBe(400);

    const badKey = await createModel({ ...bannerModel, fields: [{ key: 'Title Text', label: 'Title', type: 'text' }] });
    expect(badKey.status).toBe(400);
  });

  it('rejects a duplicate model key', async () => {
    await createModel(bannerModel);
    expect((await createModel({ ...bannerModel, name: 'Another banner' })).status).toBe(409);
  });

  it('updates name and fields, but never the key', async () => {
    const model = await (await createModel(bannerModel)).json();

    const res = await send('PATCH', `/content-models/${model.id}`, superAdmin, {
      key: 'renamed',
      name: 'Hero banner',
      fields: [
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'title', label: 'Title', type: 'text', required: true },
      ],
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated.key).toBe('banner');
    expect(updated.name).toBe('Hero banner');
    expect(updated.fields.map((f: { key: string }) => f.key)).toEqual(['image', 'title']);
  });

  it('lets a super admin delete a model', async () => {
    const model = await (await createModel(bannerModel)).json();
    expect((await send('DELETE', `/content-models/${model.id}`, admin)).status).toBe(403);
    expect((await send('DELETE', `/content-models/${model.id}`, superAdmin)).status).toBe(204);
  });
});