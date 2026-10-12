import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import Link from 'next/link';
import LogoutButton from './logout-button';

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-zinc-900">AvianDev Admin</span>
          <nav className="flex gap-4 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">
              Dashboard
            </Link>
            {user.role === 'super_admin' && (
              <Link href="/team" className="hover:text-zinc-900">
                Team
              </Link>
            )}
          </nav>
        </div>
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