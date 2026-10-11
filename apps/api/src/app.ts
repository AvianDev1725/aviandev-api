import { Hono } from 'hono';
import { requireAuth, requireRole, type AuthEnv, type SessionUser } from './middleware/auth.js';
import { createPostSchema, updatePostSchema } from './schemas/post.js';
import {
  getPublishedPosts,
  getPublishedPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostById
} from './data/posts.js';
import { validateJson } from './lib/validate.js';
import { handleError } from './lib/error.js';
import auth from './routes/auth.js';
import usersRoute from './routes/users.js';
import invitationsRoute from './routes/invitations.js';

const app = new Hono<AuthEnv>();

const canWrite = [requireAuth, requireRole('admin', 'super_admin')] as const;

function canEditPost(user: SessionUser, post: { authorId: number | null }) {
  return user.role === 'super_admin' || post.authorId === user.id;
}

app.route('/auth', auth);

app.route('/users', usersRoute);

app.route('/invitations', invitationsRoute);

app.get('/', (c) => c.text('Hello Hono!'));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/posts', async (c) => c.json(await getPublishedPosts()));

app.get('/posts/:slug', async (c) => {
  const post = await getPublishedPostBySlug(c.req.param('slug'));
  if (!post) return c.json({ error: 'Post not found' }, 404);
  return c.json(post);
});

app.post('/posts', ...canWrite, validateJson(createPostSchema), async (c) => {
  const body = c.req.valid('json');
  const post = await createPost({ ...body, authorId: c.get('user').id });
  return c.json(post, 201);
});

app.patch('/posts/:id', ...canWrite, validateJson(updatePostSchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const existing = await getPostById(id);
  if (!existing) return c.json({ error: 'Post not found' }, 404);
  if (!canEditPost(c.get('user'), existing)) return c.json({ error: 'Forbidden' }, 403);

  const post = await updatePost(id, c.req.valid('json'));
  return c.json(post);
});

app.delete('/posts/:id', ...canWrite, async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const existing = await getPostById(id);
  if (!existing) return c.json({ error: 'Post not found' }, 404);
  if (!canEditPost(c.get('user'), existing)) return c.json({ error: 'Forbidden' }, 403);

  await deletePost(id);
  return c.body(null, 204);
});

app.onError(handleError);
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

export default app;