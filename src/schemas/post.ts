import { z } from 'zod';

const postFields = {
  title: z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(200),
  slug: z
    .string({ error: 'Slug is required' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  published: z.boolean(),
};

export const createPostSchema = z.object({
  ...postFields,
  published: postFields.published.default(false),
});

export const updatePostSchema = z
  .object(postFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });