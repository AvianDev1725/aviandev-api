'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthCard, Field, FormError, SubmitButton } from '@/components/form';
import { postJson } from '@/lib/client';
import type { AcceptInviteText } from './text';

export default function AcceptInviteForm({ text }: { text: AcceptInviteText }) {
  const token = useSearchParams().get('token');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return <AuthCard title={text.invalidTitle} subtitle={text.invalidSubtitle} />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !password) return setError(text.missingFields);
    if (password.length < 12) return setError(text.passwordTooShort);
    if (password !== confirm) return setError(text.passwordMismatch);

    setError('');
    setLoading(true);
    const result = await postJson('/invitations/accept', { token, name, password });
    setLoading(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
    setDone(true);
  }

  if (done) {
    return (
      <AuthCard title={text.doneTitle} subtitle={text.doneSubtitle}>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-zinc-900 py-2.5 text-center font-medium text-white hover:bg-zinc-700"
        >
          {text.goToSignin}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={text.title} subtitle={text.subtitle}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field id="name" label={text.nameLabel} value={name} onChange={setName} autoComplete="name" />
        <Field
          id="password"
          label={text.passwordLabel}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={text.passwordHint}
        />
        <Field
          id="confirm"
          label={text.confirmLabel}
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <FormError message={error} />
        <SubmitButton loading={loading} label={text.submit} loadingLabel={text.submitting} />
      </form>
    </AuthCard>
  );
}