import { Hono } from 'hono';
import { canWrite, type AuthEnv } from '../middleware/auth.js';
import { canEditPost } from '../lib/permissions.js';
import { getPostWithCategories, listPostsForEditor } from '../data/posts.js';

const adminPostsRoute = new Hono<AuthEnv>();

adminPostsRoute.use('*', ...canWrite);

adminPostsRoute.get('/', async (c) => c.json(await listPostsForEditor(c.get('user'))));

adminPostsRoute.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400);

  const post = await getPostWithCategories(id);
  if (!post) return c.json({ error: 'Post not found' }, 404);
  if (!canEditPost(c.get('user'), post)) return c.json({ error: 'Forbidden' }, 403);

  return c.json(post);
});

export default adminPostsRoute;