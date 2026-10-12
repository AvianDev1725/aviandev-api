import { z } from 'zod';

export const slugField = z
  .string({ error: 'Slug is required' })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens');

const postFields = {
  title: z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(200),
  slug: slugField,
  excerpt: z.string().trim().max(300, 'Excerpt must be 300 characters or fewer'),
  content: z.looseObject({ type: z.literal('doc') }),
  published: z.boolean(),
  categoryIds: z
    .array(z.number().int().positive())
    .max(10, 'A post can have at most 10 categories')
    .transform((ids) => [...new Set(ids)]),
};

export const createPostSchema = z.object({
  ...postFields,
  excerpt: postFields.excerpt.default(''),
  content: postFields.content.optional(),
  published: postFields.published.default(false),
  categoryIds: postFields.categoryIds.default([]),
});

export const updatePostSchema = z
  .object(postFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });