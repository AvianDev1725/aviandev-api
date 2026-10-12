import { cacheLife, cacheTag } from 'next/cache';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

type Fallback = Record<string, unknown>;
type Fragments = Record<string, { model: string; data: Record<string, unknown> }>;

async function fetchFragments(keys: string[]): Promise<Fragments> {
  'use cache';
  cacheLife('hours');
  for (const key of keys) cacheTag(`content:${key}`);

  const res = await fetch(`${API_URL}/content?keys=${keys.map(encodeURIComponent).join(',')}`);
  if (!res.ok) throw new Error(`Content request failed: ${res.status}`);
  return res.json();
}

function merge<T extends Fallback>(fallback: T, data?: Record<string, unknown>): T {
  if (!data) return fallback;
  const result = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof T & string)[]) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== '' && typeof value === typeof fallback[key]) {
      result[key] = value as T[typeof key];
    }
  }
  return result;
}

export async function getManyByCMS<R extends Record<string, Fallback>>(fallbacks: R): Promise<R> {
  const keys = Object.keys(fallbacks).sort();
  let fragments: Fragments = {};
  try {
    fragments = await fetchFragments(keys);
  } catch (err) {
    console.error('[cms] using fallback text:', err);
  }

  return Object.fromEntries(keys.map((key) => [key, merge(fallbacks[key], fragments[key]?.data)])) as R;
}

export async function getContentByCMS<T extends Fallback>(key: string, fallback: T): Promise<T> {
  const result = await getManyByCMS({ [key]: fallback });
  return result[key] as T;
}