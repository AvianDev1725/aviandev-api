'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteJson } from '@/lib/client';
import { fill } from '@/lib/text';
import type { TeamText } from './text';

export default function DeleteMemberButton({ id, name, text }: { id: number; name: string; text: TeamText }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    if (!confirm(fill(text.deleteConfirm, { name }))) return;

    setBusy(true);
    setError('');
    const result = await deleteJson(`/users/${id}`);
    setBusy(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-sm text-red-600">
          {error}
        </span>
      )}
      <button
        onClick={remove}
        disabled={busy}
        aria-label={fill(text.deleteLabel, { name })}
        className="rounded-lg px-3 py-1.5 text-sm text-red-700 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-60"
      >
        {busy ? text.deleting : text.delete}
      </button>
    </div>
  );
}