'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthCard, Field, FormError, SubmitButton } from '@/components/form';
import { postJson } from '@/lib/client';

export default function AcceptInviteForm() {
  const token = useSearchParams().get('token');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Invalid invite link" subtitle="This link is missing its invite code. Ask for a new invite." />
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !password) return setError('Fill in all fields');
    if (password.length < 12) return setError('Password must be at least 12 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setError('');
    setLoading(true);
    const result = await postJson('/invitations/accept', { token, name, password });
    setLoading(false);

    if (!result.ok) return setError(result.error);
    setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="You're all set" subtitle="Your account is ready. Sign in to get started.">
        <Link
          href="/login"
          className="block w-full rounded-lg bg-zinc-900 py-2.5 text-center font-medium text-white hover:bg-zinc-700"
        >
          Go to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Join AvianDev Admin" subtitle="Choose your display name and a password">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field id="name" label="Display name" value={name} onChange={setName} autoComplete="name" />
        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="At least 12 characters"
        />
        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <FormError message={error} />
        <SubmitButton loading={loading} label="Create account" loadingLabel="Creating…" />
      </form>
    </AuthCard>
  );
}