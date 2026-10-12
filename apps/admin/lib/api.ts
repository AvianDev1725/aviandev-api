import { cache } from 'react';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'reader' | 'admin' | 'super_admin';
};

export async function apiGet<T>(path: string): Promise<T | null> {
  const session = (await cookies()).get('session');
  if (!session) return null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: `session=${session.value}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export const getCurrentUser = cache(async () => {
  const data = await apiGet<{ user: User }>('/auth/me');
  return data?.user ?? null;
});