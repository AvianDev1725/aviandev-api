import Link from 'next/link';
import { apiGet, getCurrentUser } from '@/lib/api';
import type { ContentModel } from '@/lib/content-types';
import FragmentForm from '../fragment-form';
import { getManyByCMS } from '@/lib/content';
import { contentText, richTextText } from '../text';

export const instant = false;

export default async function NewContentPage() {
  const [user, models, cms] = await Promise.all([
    getCurrentUser(),
    apiGet<ContentModel[]>('/content-models'),
    getManyByCMS({ 'admin-content': contentText, 'admin-rich-text': richTextText }),
  ]);
  const text = cms['admin-content'];

  if (!models || models.length === 0) {
    return (
      <div className="max-w-3xl space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-200">
        <p className="text-zinc-700">{text.noModels}</p>
        {user?.role === 'super_admin' && (
          <Link href="/models/new" className="font-medium text-zinc-900 underline">
            {text.goToModels}
          </Link>
        )}
      </div>
    );
  }

  return <FragmentForm text={text} richText={cms['admin-rich-text']} models={models} canDelete={false} />;
}