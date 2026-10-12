import { notFound, redirect } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import type { ContentModel, FieldTypeInfo } from '@/lib/content-types';
import ModelBuilder from '../model-builder';
import { modelsText } from '../text';

export const instant = false;

export default async function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') redirect('/');

  const { id } = await params;
  const [fieldTypes, model] = await Promise.all([
    apiGet<FieldTypeInfo>('/content-models/field-types'),
    apiGet<ContentModel>(`/content-models/${id}`),
  ]);

  if (!model) notFound();
  if (!fieldTypes) throw new Error('Could not load field types');

  return <ModelBuilder text={modelsText} fieldTypes={fieldTypes} model={model} />;
}