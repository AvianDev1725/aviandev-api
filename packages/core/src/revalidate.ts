import { timingSafeEqual } from 'node:crypto';

const TAG_PATTERN = /^(posts|categories|(content|post|category):[a-z0-9-]+)$/;

export function isValidSecret(given: string | null, expected: string | undefined) {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseTags(body: unknown): string[] {
  const tags = (body as { tags?: unknown })?.tags;
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag): tag is string => typeof tag === 'string' && TAG_PATTERN.test(tag)).slice(0, 100);
}