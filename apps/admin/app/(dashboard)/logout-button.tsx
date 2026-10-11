'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className="rounded-lg px-3 py-1.5 ring-1 ring-zinc-300 hover:bg-zinc-100">
      Log out
    </button>
  );
}