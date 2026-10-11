import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { requireAuth, requireRole, type AuthEnv } from '../middleware/auth.js';

const usersRoute = new Hono<AuthEnv>();

usersRoute.use('*', requireAuth, requireRole('super_admin'));

usersRoute.get('/pending', async (c) => {
  const pending = await db
    .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.status, 'pending'))
    .orderBy(asc(users.createdAt));
  return c.json(pending);
});

async function reviewRequest(id: number, reviewerId: number, status: 'active' | 'rejected') {
  const [user] = await db
    .update(users)
    .set({ status, reviewedBy: reviewerId, reviewedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.status, 'pending')))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status });
  return user;
}

usersRoute.post('/:id/approve', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const user = await reviewRequest(id, c.get('user').id, 'active');
  if (!user) return c.json({ error: 'No pending request with this id' }, 404);
  return c.json(user);
});

usersRoute.post('/:id/reject', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const user = await reviewRequest(id, c.get('user').id, 'rejected');
  if (!user) return c.json({ error: 'No pending request with this id' }, 404);
  return c.json(user);
});

export default usersRoute;