import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';
import { canWrite, requireAuth, requireRole, type AuthEnv } from '../middleware/auth.js';
import { validateJson } from '../lib/validate.js';
import { slugField } from '../schemas/post.js';

const categoryFields = {
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required').max(60),
  slug: slugField,
  description: z.string().trim().max(300, 'Description must be 300 characters or fewer'),
};

const createCategorySchema = z.object({
  ...categoryFields,
  description: categoryFields.description.default(''),
});

const updateCategorySchema = z
  .object(categoryFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' });

const categoriesRoute = new Hono<AuthEnv>();

categoriesRoute.get('/', async (c) => {
  const list = await db.select().from(categories).orderBy(asc(categories.name));
  return c.json(list);
});

categoriesRoute.post('/', ...canWrite, validateJson(createCategorySchema), async (c) => {
  const [category] = await db.insert(categories).values(c.req.valid('json')).returning();
  return c.json(category, 201);
});

categoriesRoute.patch('/:id', ...canWrite, validateJson(updateCategorySchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const [category] = await db
    .update(categories)
    .set(c.req.valid('json'))
    .where(eq(categories.id, id))
    .returning();
  if (!category) return c.json({ error: 'Category not found' }, 404);
  return c.json(category);
});

categoriesRoute.delete('/:id', requireAuth, requireRole('super_admin'), async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  if (!deleted) return c.json({ error: 'Category not found' }, 404);
  return c.body(null, 204);
});

export default categoriesRoute;