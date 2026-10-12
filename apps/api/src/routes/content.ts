import { Hono } from 'hono';
import { getFragments } from '../lib/content.js';

const MAX_KEYS = 20;

const contentRoute = new Hono();

contentRoute.get('/', async (c) => {
  const keys = [...new Set((c.req.query('keys') ?? '').split(',').map((key) => key.trim()).filter(Boolean))];
  if (keys.length === 0) return c.json({ error: 'Provide keys, e.g. ?keys=home-banner,site-labels' }, 400);
  if (keys.length > MAX_KEYS) return c.json({ error: `Request at most ${MAX_KEYS} keys at once` }, 400);

  const fragments = await getFragments(keys);
  return c.json(Object.fromEntries(fragments.map((f) => [f.key, { model: f.model, data: f.data }])));
});

contentRoute.get('/:key', async (c) => {
  const [fragment] = await getFragments([c.req.param('key')]);
  if (!fragment) return c.json({ error: 'Content not found' }, 404);
  return c.json(fragment);
});

export default contentRoute;