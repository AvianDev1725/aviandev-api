import { cache } from 'react';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'reader' | 'admin' | 'super_admin';
};

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = (await cookies()).get('session');
  if (!session) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `session=${session.value}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;

  const { user } = await res.json();
  return user;
});