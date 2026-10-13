export type Fallback = Record<string, unknown>;
export type Fragments = Record<string, { model: string; data: Record<string, unknown> }>;

export function contentUrl(apiUrl: string, keys: string[]) {
  return `${apiUrl}/content?keys=${keys.map(encodeURIComponent).join(',')}`;
}

export function mergeContent<T extends Fallback>(fallback: T, data?: Record<string, unknown>): T {
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

export function mergeAll<R extends Record<string, Fallback>>(fallbacks: R, fragments: Fragments): R {
  return Object.fromEntries(
    Object.keys(fallbacks).map((key) => [key, mergeContent(fallbacks[key], fragments[key]?.data)])
  ) as R;
}