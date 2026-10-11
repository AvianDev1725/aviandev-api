import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getPublishedPosts, getPublishedPostBySlug, createPost, updatePost, deletePost } from './data/posts.js';

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/posts', async (c) => c.json(await getPublishedPosts()));

app.get('/posts/:slug', async (c) => {
  const post = await getPublishedPostBySlug(c.req.param('slug'));
  if (!post) return c.json({ error: 'Post not found' }, 404);
  return c.json(post);
});

app.post('/posts', async (c) => {
  const body = await c.req.json();
  const post = await createPost(body);
  return c.json(post, 201);
});

app.patch('/posts/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({ error: 'Invalid id' }, 400);

  const body = await c.req.json();
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

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});