import { redirect } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import type { FieldTypeInfo } from '@/lib/content-types';
import ModelBuilder from '../model-builder';
import { modelsText } from '../text';

export const instant = false;

export default async function NewModelPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') redirect('/');

  const fieldTypes = await apiGet<FieldTypeInfo>('/content-models/field-types');
  if (!fieldTypes) throw new Error('Could not load field types');

  return <ModelBuilder text={modelsText} fieldTypes={fieldTypes} />;
}