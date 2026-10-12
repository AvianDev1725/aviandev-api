import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

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

const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
};

function isSafeLink(value: string) {
  return value === '' || /^https?:\/\//i.test(value) || (value.startsWith('/') && !value.startsWith('//'));
}

const textLimits = { text: 500, longText: 5000, richText: 50000, image: 2000, link: 2000 } as const;

function valueSchema(field: FieldDefinition): z.ZodType {
  const missing = (kind: string) => ({
    error: (issue: { input: unknown }) =>
      issue.input === undefined ? `${field.label} is required` : `${field.label} must be ${kind}`,
  });

  if (field.type === 'number') {
    const schema = z.number(missing('a number'));
    return field.required ? schema : schema.nullable().default(null);
  }

  if (field.type === 'boolean') {
    const schema = z.boolean(missing('yes or no'));
    return field.required ? schema : schema.default(false);
  }

  const limit = textLimits[field.type];
  let schema = z.string(missing('text')).trim().max(limit, `${field.label} must be ${limit} characters or fewer`);
  if (field.required) schema = schema.min(1, `${field.label} is required`);
  if (field.type === 'image' || field.type === 'link') {
    schema = schema.refine(isSafeLink, `${field.label} must start with https:// or /`);
  }

  const withDefault = field.required ? schema : schema.default('');
  return field.type === 'richText' ? withDefault.transform((html) => sanitizeHtml(html, richTextOptions)) : withDefault;
}

export function dataSchemaFor(fields: FieldDefinition[]) {
  return z.object(Object.fromEntries(fields.map((field) => [field.key, valueSchema(field)])));
}

function emptyValue(type: FieldType) {
  if (type === 'boolean') return false;
  if (type === 'number') return null;
  return '';
}

export function shapeData(fields: FieldDefinition[], data: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => [field.key, Object.hasOwn(data, field.key) ? data[field.key] : emptyValue(field.type)])
  );
}