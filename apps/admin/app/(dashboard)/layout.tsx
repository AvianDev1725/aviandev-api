import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import LogoutButton from './logout-button';

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <span className="font-semibold text-zinc-900">AvianDev Admin</span>
        <div className="flex items-center gap-4 text-sm text-zinc-600">
          <span>
            {user.name} · {user.role === 'super_admin' ? 'Super admin' : 'Admin'}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}