import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

function postgresCode(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code ?? e?.cause?.code;
}

export function handleError(err: Error, c: Context) {
  const code = postgresCode(err);
  if (code === '23505') return c.json({ error: 'This already exists' }, 409);
  if (code === '23503' || code === '23001') {
    return c.json({ error: 'This is still in use by other content' }, 409);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
}