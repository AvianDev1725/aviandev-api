export type FieldType = 'text' | 'longText' | 'number' | 'richText' | 'image' | 'link' | 'boolean';

export type FieldDefinition = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  help: string;
};

export type ContentModel = {
  id: number;
  key: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
  updatedAt: string;
};

export type FieldTypeInfo = Record<FieldType, { label: string; description: string }>;