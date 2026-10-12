import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { apiGet, getCurrentUser } from '@/lib/api';
import { fill } from '@/lib/text';
import type { ContentModel } from '@/lib/content-types';
import { getContentByCMS } from '@/lib/content';
import { modelsText } from './text';

export const instant = false;

export default async function ModelsPage() {
  const text = await getContentByCMS('admin-models', modelsText);
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') redirect('/');

  const models = (await apiGet<ContentModel[]>('/content-models')) ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{text.listTitle}</h1>
          <p className="mt-1 text-zinc-500">{text.listSubtitle}</p>
        </div>
        <Link
          href="/models/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          <Plus size={16} aria-hidden />
          {text.newModel}
        </Link>
      </div>

      {models.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-zinc-500 ring-1 ring-zinc-200">{text.empty}</p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
          {models.map((model) => (
            <li key={model.id}>
              <Link href={`/models/${model.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{model.name}</p>
                  <p className="text-sm text-zinc-500">
                    {model.key} · {fill(text.fieldsCount, { count: model.fields.length })}
                  </p>
                  {model.description && <p className="mt-1 truncate text-sm text-zinc-500">{model.description}</p>}
                </div>
                <span className="shrink-0 text-sm font-medium text-zinc-700">{text.edit}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}