import Link from 'next/link';
import { Plus } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fill } from '@/lib/text';
import { getContentByCMS } from '@/lib/content';
import { contentText } from './text';

export const instant = false;

type FragmentRow = { key: string; model: string; modelName: string; updatedAt: string };

export default async function ContentPage() {
  const text = await getContentByCMS('admin-content', contentText);
  const fragments = (await apiGet<FragmentRow[]>('/content-fragments')) ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{text.listTitle}</h1>
          <p className="mt-1 text-zinc-500">{text.listSubtitle}</p>
        </div>
        <Link
          href="/content/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          <Plus size={16} aria-hidden />
          {text.newContent}
        </Link>
      </div>

      {fragments.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-sm text-zinc-500 ring-1 ring-zinc-200">{text.empty}</p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
          {fragments.map((fragment) => (
            <li key={fragment.key}>
              <Link href={`/content/${fragment.key}`} className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{fragment.key}</p>
                  <p className="text-sm text-zinc-500">
                    {fragment.modelName} ·{' '}
                    {fill(text.updatedOn, {
                      date: new Date(fragment.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }),
                    })}
                  </p>
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