import { z } from 'zod';

const postFields = {
  title: z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(200),
  slug: z
    .string({ error: 'Slug is required' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  excerpt: z.string().trim().max(300, 'Excerpt must be 300 characters or fewer'),
  content: z.looseObject({ type: z.literal('doc') }),
  published: z.boolean(),
};

export const createPostSchema = z.object({
  ...postFields,
  excerpt: postFields.excerpt.default(''),
  content: postFields.content.optional(),
  published: postFields.published.default(false),
});

export const updatePostSchema = z
  .object(postFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });