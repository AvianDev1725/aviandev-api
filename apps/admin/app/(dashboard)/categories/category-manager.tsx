'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, FormError } from '@/components/form';
import { deleteJson, patchJson, postJson } from '@/lib/client';
import { fill, toSlug } from '@/lib/text';
import type { CategoriesText } from './text';

export type Category = { id: number; name: string; slug: string; description: string };

type Props = { categories: Category[]; text: CategoriesText; canDelete: boolean };

export default function CategoryManager({ categories, text, canDelete }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function changeName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return setError(text.missingName);

    setError('');
    setSaving(true);
    const result = await postJson('/categories', { name, slug, description });
    setSaving(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
    setName('');
    setSlug('');
    setSlugEdited(false);
    setDescription('');
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={add} noValidate className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="font-semibold text-zinc-900">{text.addTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="new-name" label={text.nameLabel} value={name} onChange={changeName} autoComplete="off" />
          <Field
            id="new-slug"
            label={text.slugLabel}
            value={slug}
            onChange={(value) => {
              setSlug(value);
              setSlugEdited(true);
            }}
            hint={text.slugHelp}
            autoComplete="off"
          />
          <div className="sm:col-span-2">
            <Field
              id="new-description"
              label={text.descriptionLabel}
              value={description}
              onChange={setDescription}
              autoComplete="off"
            />
          </div>
        </div>
        <FormError message={error} />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {saving ? text.adding : text.add}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{fill(text.listHeading, { count: categories.length })}</h2>
        {categories.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-zinc-500 ring-1 ring-zinc-200">{text.empty}</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl bg-white ring-1 ring-zinc-200">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} text={text} canDelete={canDelete} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CategoryRow({ category, text, canDelete }: { category: Category; text: CategoriesText; canDelete: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(category.description);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function cancel() {
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setError('');
    setEditing(false);
  }

  async function save() {
    if (!name.trim()) return setError(text.missingName);
    setBusy(true);
    setError('');
    const result = await patchJson(`/categories/${category.id}`, { name, slug, description });
    setBusy(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(fill(text.deleteConfirm, { name: category.name }))) return;
    setBusy(true);
    const result = await deleteJson(`/categories/${category.id}`);
    setBusy(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
    router.refresh();
  }

  if (editing) {
    const prefix = `category-${category.id}`;
    return (
      <li className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id={`${prefix}-name`} label={text.nameLabel} value={name} onChange={setName} autoComplete="off" />
          <Field id={`${prefix}-slug`} label={text.slugLabel} value={slug} onChange={setSlug} autoComplete="off" />
          <div className="sm:col-span-2">
            <Field
              id={`${prefix}-description`}
              label={text.descriptionLabel}
              value={description}
              onChange={setDescription}
              autoComplete="off"
            />
          </div>
        </div>
        <FormError message={error} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {busy ? text.saving : text.save}
          </button>
          <button type="button" onClick={cancel} className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-300 hover:bg-zinc-100">
            {text.cancel}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-medium text-zinc-900">{category.name}</p>
        <p className="text-sm text-zinc-500">{category.slug}</p>
        {category.description && <p className="mt-1 text-sm text-zinc-500">{category.description}</p>}
        <FormError message={error} />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={fill(text.editLabel, { name: category.name })}
          className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-300 hover:bg-zinc-100"
        >
          {text.edit}
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            aria-label={fill(text.deleteLabel, { name: category.name })}
            className="rounded-lg px-3 py-1.5 text-sm text-red-700 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-60"
          >
            {text.delete}
          </button>
        )}
      </div>
    </li>
  );
}