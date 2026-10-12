import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { contentFragments, contentModels } from '../db/schema.js';
import { shapeData } from '../content/field-types.js';

export async function getFragments(keys: string[]) {
  if (keys.length === 0) return [];

  const rows = await db
    .select({
      key: contentFragments.key,
      data: contentFragments.data,
      model: contentModels.key,
      fields: contentModels.fields,
    })
    .from(contentFragments)
    .innerJoin(contentModels, eq(contentFragments.modelId, contentModels.id))
    .where(inArray(contentFragments.key, keys));

  return rows.map((row) => ({ key: row.key, model: row.model, data: shapeData(row.fields, row.data) }));
}

export async function getText<T extends Record<string, string>>(key: string, fallback: T): Promise<T> {
  try {
    const [fragment] = await getFragments([key]);
    if (!fragment) return fallback;

    const result = { ...fallback };
    for (const name of Object.keys(fallback) as (keyof T & string)[]) {
      const value = fragment.data[name];
      if (typeof value === 'string' && value.trim() !== '') result[name] = value as T[typeof name];
    }
    return result;
  } catch {
    return fallback;
  }
}