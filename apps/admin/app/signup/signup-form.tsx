'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthCard, Field, FormError, SubmitButton } from '@/components/form';
import { postJson } from '@/lib/client';
import type { SignupText } from './text';

export default function SignupForm({ text }: { text: SignupText }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email || !password) return setError(text.missingFields);
    if (password.length < 12) return setError(text.passwordTooShort);
    if (password !== confirm) return setError(text.passwordMismatch);

    setError('');
    setLoading(true);
    const result = await postJson('/auth/signup', { name, email, password });
    setLoading(false);

    if (!result.ok) return setError(result.error || text.errorFallback);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title={text.sentTitle} subtitle={text.sentSubtitle}>
        <Link href="/login" className="block text-center text-sm font-medium text-zinc-900 underline">
          {text.backToSignin}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={text.title} subtitle={text.subtitle}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field id="name" label={text.nameLabel} value={name} onChange={setName} autoComplete="name" />
        <Field id="email" label={text.emailLabel} type="email" value={email} onChange={setEmail} autoComplete="email" />
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

      <p className="text-center text-sm text-zinc-500">
        {text.signinPrompt}{' '}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          {text.signinLink}
        </Link>
      </p>
    </AuthCard>
  );
}