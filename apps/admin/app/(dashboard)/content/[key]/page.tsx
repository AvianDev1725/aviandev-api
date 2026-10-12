import { notFound } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import { getManyByCMS } from '@/lib/content';
import FragmentForm, { type Fragment } from '../fragment-form';
import { contentText, richTextText } from '../text';

export const instant = false;

export default async function EditContentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  const [user, fragment, cms] = await Promise.all([
    getCurrentUser(),
    apiGet<Fragment>(`/content-fragments/${key}`),
    getManyByCMS({ 'admin-content': contentText, 'admin-rich-text': richTextText }),
  ]);

  if (!fragment) notFound();

  return (
    <FragmentForm
      text={cms['admin-content']}
      richText={cms['admin-rich-text']}
      models={[]}
      fragment={fragment}
      canDelete={user?.role === 'super_admin'}
    />
  );
}