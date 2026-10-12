'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthCard, Field, FormError, SubmitButton } from '@/components/form';
import { postJson } from '@/lib/client';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email || !password) return setError('Fill in all fields');
    if (password.length < 12) return setError('Password must be at least 12 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setError('');
    setLoading(true);
    const result = await postJson('/auth/signup', { name, email, password });
    setLoading(false);

    if (!result.ok) return setError(result.error);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Request sent" subtitle="You'll be able to sign in once a super admin approves your request.">
        <Link href="/login" className="block text-center text-sm font-medium text-zinc-900 underline">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Request access" subtitle="A super admin will review your request">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field id="name" label="Name" value={name} onChange={setName} autoComplete="name" />
        <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
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
        <SubmitButton loading={loading} label="Request access" loadingLabel="Sending…" />
      </form>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}