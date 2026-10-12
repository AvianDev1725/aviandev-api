import { notFound } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import FragmentForm, { type Fragment } from '../fragment-form';
import { contentText as text } from '../text';

export const instant = false;

export default async function EditContentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const [user, fragment] = await Promise.all([getCurrentUser(), apiGet<Fragment>(`/content-fragments/${key}`)]);

  if (!fragment) notFound();

  return <FragmentForm text={text} models={[]} fragment={fragment} canDelete={user?.role === 'super_admin'} />;
}