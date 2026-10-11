import { Hono } from 'hono';
import { createPostSchema, updatePostSchema } from './schemas/post.js';
import {
  getPublishedPosts,
  getPublishedPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from './data/posts.js';
import { validateJson } from './lib/validate.js';
import { handleError } from './lib/error.js';
import auth from './routes/auth.js';

const app = new Hono();

app.route('/auth', auth);

app.get('/', (c) => c.text('Hello Hono!'));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/posts', async (c) => c.json(await getPublishedPosts()));

app.get('/posts/:slug', async (c) => {
  const post = await getPublishedPostBySlug(c.req.param('slug'));
  if (!post) return c.json({ error: 'Post not found' }, 404);
  return c.json(post);
});

app.post('/posts', validateJson(createPostSchema), async (c) => {
  const body = c.req.valid('json');
  const post = await createPost(body);
  return c.json(post, 201);
});

app.patch('/posts/:id', validateJson(updatePostSchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const body = c.req.valid('json');
  const post = await updatePost(id, body);
  if (!post) return c.json({ error: 'Post not found' }, 404);
  return c.json(post);
});

app.delete('/posts/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const post = await deletePost(id);
  if (!post) return c.json({ error: 'Post not found' }, 404);
  return c.body(null, 204);
});

app.onError(handleError);
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

export default app;