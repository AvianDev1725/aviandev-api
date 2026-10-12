import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { contentFragments, contentModels } from '../db/schema.js';
import { canWrite, requireAuth, requireRole, type AuthEnv } from '../middleware/auth.js';
import { formatIssues, validateJson } from '../lib/validate.js';
import { slugField } from '../schemas/post.js';
import { dataSchemaFor, shapeData } from '../content/field-types.js';
import { notifyContentChanged } from '../lib/revalidate.js';

const saveFragmentSchema = z.object({
  model: slugField,
  data: z.record(z.string(), z.unknown()),
});

const fragmentsRoute = new Hono<AuthEnv>();

fragmentsRoute.get('/', ...canWrite, async (c) => {
  const list = await db
    .select({
      key: contentFragments.key,
      model: contentModels.key,
      modelName: contentModels.name,
      updatedAt: contentFragments.updatedAt,
    })
    .from(contentFragments)
    .innerJoin(contentModels, eq(contentFragments.modelId, contentModels.id))
    .orderBy(asc(contentFragments.key));
  return c.json(list);
});

fragmentsRoute.get('/:key', ...canWrite, async (c) => {
  const [row] = await db
    .select({ key: contentFragments.key, data: contentFragments.data, model: contentModels })
    .from(contentFragments)
    .innerJoin(contentModels, eq(contentFragments.modelId, contentModels.id))
    .where(eq(contentFragments.key, c.req.param('key')));

  if (!row) return c.json({ error: 'Content not found' }, 404);
  return c.json({ key: row.key, model: row.model, data: shapeData(row.model.fields, row.data) });
});

fragmentsRoute.put('/:key', ...canWrite, validateJson(saveFragmentSchema), async (c) => {
  const keyCheck = slugField.safeParse(c.req.param('key'));
  if (!keyCheck.success) return c.json({ error: 'Key must be lowercase letters, numbers and hyphens' }, 400);
  const key = keyCheck.data;
  const { model: modelKey, data } = c.req.valid('json');

  const [model] = await db.select().from(contentModels).where(eq(contentModels.key, modelKey));
  if (!model) return c.json({ error: `Unknown model: ${modelKey}` }, 400);

  const [existing] = await db
    .select({ modelId: contentFragments.modelId })
    .from(contentFragments)
    .where(eq(contentFragments.key, key));
  if (existing && existing.modelId !== model.id) {
    return c.json({ error: `"${key}" already uses a different model` }, 409);
  }

  const parsed = dataSchemaFor(model.fields).safeParse(data);
  if (!parsed.success) return c.json(formatIssues(parsed.error.issues, 'data'), 400);

  const values = { key, modelId: model.id, data: parsed.data, updatedBy: c.get('user').id };
  if (existing) {
    await db.update(contentFragments).set(values).where(eq(contentFragments.key, key));
  } else {
    await db.insert(contentFragments).values(values);
  }
  notifyContentChanged([key]);
  return c.json({ key, model: model.key, data: parsed.data }, existing ? 200 : 201);
});

fragmentsRoute.delete('/:key', requireAuth, requireRole('super_admin'), async (c) => {
  const [deleted] = await db
    .delete(contentFragments)
    .where(eq(contentFragments.key, c.req.param('key')))
    .returning({ key: contentFragments.key });

  if (!deleted) return c.json({ error: 'Content not found' }, 404);
  notifyContentChanged([deleted.key]);
  return c.body(null, 204);
});

export default fragmentsRoute;