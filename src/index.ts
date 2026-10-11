import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getPostBySlug, getPublishedPosts, createPost } from './data/posts.js';

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/posts', (c) => c.json(getPublishedPosts()));

app.get('/posts/:slug', (c) => {
  const slug = c.req.param('slug');
  const post = getPostBySlug(slug);
  if (!post || !post.published) {
    return c.json({ error: 'Post not found' }, 404);
  }
  return c.json(post);
});

app.post('/posts', async (c) => {
  const body = await c.req.json();
  const post = createPost(body);
  return c.json(post, 201);
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});