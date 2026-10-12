import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

function isValidSecret(given: string | null) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!isValidSecret(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tags: string[] = Array.isArray(body?.tags)
    ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.startsWith('content:')).slice(0, 100)
    : [];

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}