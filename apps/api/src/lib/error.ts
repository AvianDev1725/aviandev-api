import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
}

export function handleError(err: Error, c: Context) {
  if (isUniqueViolation(err)) {
    return c.json({ error: 'This already exists' }, 409);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
}