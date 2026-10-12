'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard, Field, FormError, SubmitButton } from '@/components/form';
import { postJson } from '@/lib/client';
import type { LoginText } from './text';

export default function LoginForm({ text }: { text: LoginText }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) return setError(text.missingFields);

    setError('');
    setLoading(true);
    const result = await postJson('/auth/login', { email, password });
    setLoading(false);

    if (!result.ok) return setError(result.error);
    router.push('/');
    router.refresh();
  }

  return (
    <AuthCard title={text.title} subtitle={text.subtitle}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field id="email" label={text.emailLabel} type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field
          id="password"
          label={text.passwordLabel}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <FormError message={error} />
        <SubmitButton loading={loading} label={text.submit} loadingLabel={text.submitting} />
      </form>
      <p className="text-center text-sm text-zinc-500">
        {text.signupPrompt}{' '}
        <Link href="/signup" className="font-medium text-zinc-900 underline">
          {text.signupLink}
        </Link>
      </p>
    </AuthCard>
  );
}