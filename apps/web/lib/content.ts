import { cacheLife, cacheTag } from 'next/cache';
import { contentUrl, mergeAll, type Fallback, type Fragments } from '@aviandev/core/content';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function fetchFragments(keys: string[]): Promise<Fragments> {
  'use cache';
  cacheLife('hours');
  for (const key of keys) cacheTag(`content:${key}`);

  const res = await fetch(contentUrl(API_URL, keys));
  if (!res.ok) throw new Error(`Content request failed: ${res.status}`);
  return res.json();
}

export async function getManyByCMS<R extends Record<string, Fallback>>(fallbacks: R): Promise<R> {
  const keys = Object.keys(fallbacks).sort();
  let fragments: Fragments = {};
  try {
    fragments = await fetchFragments(keys);
  } catch (err) {
    console.error('[cms] using fallback text:', err);
  }
  return mergeAll(fallbacks, fragments);
}

export async function getContentByCMS<T extends Fallback>(key: string, fallback: T): Promise<T> {
  const result = await getManyByCMS({ [key]: fallback });
  return result[key] as T;
}