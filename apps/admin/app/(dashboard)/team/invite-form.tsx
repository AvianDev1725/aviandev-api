'use client';

import { useState } from 'react';
import { Field, FormError } from '@/components/form';
import { postJson } from '@/lib/client';
import { fill } from '@/lib/text';
import type { TeamText } from './text';

type Role = 'admin' | 'super_admin';
type Invite = { email: string; role: Role; inviteUrl: string; emailSent: boolean };

export default function InviteForm({ text }: { text: TeamText }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return setError(text.inviteMissingEmail);

    setError('');
    setLoading(true);
    setInvite(null);
    setCopied(false);
    const result = await postJson<Invite>('/invitations', { email, role });
    setLoading(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
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
          <Field id="invite-email" label={text.inviteEmailLabel} type="email" value={email} onChange={setEmail} autoComplete="off" />
        </div>
        <div className="space-y-1">
          <label htmlFor="invite-role" className="text-sm font-medium text-zinc-700">
            {text.inviteRoleLabel}
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          >
            <option value="admin">{text.roleAdmin}</option>
            <option value="super_admin">{text.roleSuperAdmin}</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {loading ? text.inviteSubmitting : text.inviteSubmit}
        </button>
      </form>

      <FormError message={error} />

      {invite && (
        <div role="status" className="space-y-2 rounded-lg bg-zinc-50 p-4 text-sm">
          <p className="text-zinc-700">
            {fill(invite.emailSent ? text.inviteSent : text.inviteNotSent, { email: invite.email })}
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={invite.inviteUrl}
              aria-label={text.inviteLinkLabel}
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-700"
            />
            <button type="button" onClick={copyLink} className="rounded-lg px-3 py-2 ring-1 ring-zinc-300 hover:bg-zinc-100">
              {copied ? text.copied : text.copy}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}