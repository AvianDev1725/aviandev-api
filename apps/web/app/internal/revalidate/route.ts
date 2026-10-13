import { revalidateTag } from 'next/cache';
import { isValidSecret, parseTags } from '@aviandev/core/revalidate';

export async function POST(request: Request) {
  if (!isValidSecret(request.headers.get('x-revalidate-secret'), process.env.REVALIDATE_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tags = parseTags(await request.json().catch(() => null));
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}