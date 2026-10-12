import { z } from 'zod';

export const fieldTypes = {
  text: { label: 'Text', description: 'A single line of text' },
  longText: { label: 'Long text', description: 'Several lines of plain text' },
  number: { label: 'Number', description: 'A whole or decimal number' },
  richText: { label: 'Rich text', description: 'Formatted text with headings, links and lists' },
  image: { label: 'Image', description: 'An image address' },
  link: { label: 'Link', description: 'An address of a page or site' },
  boolean: { label: 'Toggle', description: 'Yes or no' },
} as const;

export type FieldType = keyof typeof fieldTypes;
const fieldTypeNames = Object.keys(fieldTypes) as [FieldType, ...FieldType[]];

export const fieldDefinitionSchema = z.object({
  key: z
    .string({ error: 'Field key is required' })
    .max(40)
    .regex(/^[a-z][a-zA-Z0-9]*$/, 'Field keys start with a lowercase letter and use only letters and numbers, e.g. ctaLabel'),
  label: z.string({ error: 'Field label is required' }).trim().min(1, 'Field label is required').max(60),
  type: z.enum(fieldTypeNames, { error: 'Unknown field type' }),
  required: z.boolean().default(false),
  help: z.string().trim().max(200).default(''),
});

export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;

export const modelFieldsSchema = z
  .array(fieldDefinitionSchema)
  .min(1, 'Add at least one field')
  .max(50, 'A model can have at most 50 fields')
  .refine((fields) => new Set(fields.map((f) => f.key)).size === fields.length, {
    message: 'Each field key must be unique',
  });