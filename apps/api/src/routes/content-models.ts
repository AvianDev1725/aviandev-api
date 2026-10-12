import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { contentModels } from '../db/schema.js';
import { canWrite, requireAuth, requireRole, type AuthEnv } from '../middleware/auth.js';
import { validateJson } from '../lib/validate.js';
import { slugField } from '../schemas/post.js';
import { fieldTypes, modelFieldsSchema } from '../content/field-types.js';

const modelBase = {
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required').max(60),
  description: z.string().trim().max(300),
  fields: modelFieldsSchema,
};

const createModelSchema = z.object({
  key: slugField,
  ...modelBase,
  description: modelBase.description.default(''),
});

const updateModelSchema = z
  .object(modelBase)
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' });

const superAdminOnly = [requireAuth, requireRole('super_admin')] as const;

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const contentModelsRoute = new Hono<AuthEnv>();

contentModelsRoute.get('/field-types', ...canWrite, (c) => c.json(fieldTypes));

contentModelsRoute.get('/', ...canWrite, async (c) => {
  const list = await db.select().from(contentModels).orderBy(asc(contentModels.name));
  return c.json(list);
});

contentModelsRoute.get('/:id', ...canWrite, async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'Invalid id' }, 400);

  const [model] = await db.select().from(contentModels).where(eq(contentModels.id, id));
  if (!model) return c.json({ error: 'Model not found' }, 404);
  return c.json(model);
});

contentModelsRoute.post('/', ...superAdminOnly, validateJson(createModelSchema), async (c) => {
  const [model] = await db.insert(contentModels).values(c.req.valid('json')).returning();
  return c.json(model, 201);
});

contentModelsRoute.patch('/:id', ...superAdminOnly, validateJson(updateModelSchema), async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'Invalid id' }, 400);

  const [model] = await db
    .update(contentModels)
    .set(c.req.valid('json'))
    .where(eq(contentModels.id, id))
    .returning();
  if (!model) return c.json({ error: 'Model not found' }, 404);
  return c.json(model);
});

contentModelsRoute.delete('/:id', ...superAdminOnly, async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ error: 'Invalid id' }, 400);

  const [deleted] = await db.delete(contentModels).where(eq(contentModels.id, id)).returning({ id: contentModels.id });
  if (!deleted) return c.json({ error: 'Model not found' }, 404);
  return c.body(null, 204);
});

export default contentModelsRoute;