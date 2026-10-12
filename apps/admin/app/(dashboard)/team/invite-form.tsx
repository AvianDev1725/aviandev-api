'use client';

import { useState } from 'react';
import { Field, FormError } from '@/components/form';
import { postJson } from '@/lib/client';

type Role = 'admin' | 'super_admin';
type Invite = { email: string; role: Role; inviteUrl: string; emailSent: boolean };

export default function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return setError('Enter an email address');

    setError('');
    setLoading(true);
    setInvite(null);
    setCopied(false);
    const result = await postJson<Invite>('/invitations', { email, role });
    setLoading(false);

    if (!result.ok) return setError(result.error);
    setInvite(result.data);
    setEmail('');
  }

  async function copyLink() {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.inviteUrl);
    setCopied(true);
  }

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-zinc-200">
      <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Field id="invite-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="off" />
        </div>
        <div className="space-y-1">
          <label htmlFor="invite-role" className="text-sm font-medium text-zinc-700">
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create invite'}
        </button>
      </form>

      <FormError message={error} />

      <p className="text-zinc-700">
        {invite?.emailSent ? (
          <>
            Invite emailed to <span className="font-medium">{invite.email}</span>. You can also share this link (valid
            for 48 hours):
          </>
        ) : (
          <>
            Invite created, but the email couldn't be sent. Share this link with{' '}
            <span className="font-medium">{invite?.email}</span> yourself (valid for 48 hours):
          </>
        )}
      </p>
    </div>
  );
}