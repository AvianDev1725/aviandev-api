'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@/lib/client';

export default function ReviewButtons({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function review(action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm(`Reject ${name}'s request? This can't be undone.`)) return;

    setBusy(true);
    setError('');
    const result = await postJson(`/users/${id}/${action}`, {});
    setBusy(false);

    if (!result.ok) return setError(result.error);
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
        onClick={() => review('reject')}
        disabled={busy}
        className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-zinc-300 hover:bg-zinc-100 disabled:opacity-60"
      >
        Reject
      </button>
      <button
        onClick={() => review('approve')}
        disabled={busy}
        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        Approve
      </button>
    </div>
  );
}