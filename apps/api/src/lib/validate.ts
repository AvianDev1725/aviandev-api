import { zValidator } from '@hono/zod-validator';
import type { ZodType } from 'zod';

type Issue = { path: readonly PropertyKey[]; message: string };

export function formatIssues(issues: readonly Issue[], prefix = '') {
  return {
    error: 'Validation failed',
    details: issues.map((issue) => ({
      field: [prefix, ...issue.path.map(String)].filter(Boolean).join('.'),
      message: issue.message,
    })),
  };
}

export const validateJson = <T extends ZodType>(schema: T) =>
  zValidator('json', schema, (result, c) => {
    if (!result.success) return c.json(formatIssues(result.error.issues), 400);
  });