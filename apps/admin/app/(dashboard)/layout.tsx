import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import Sidebar, { type SidebarLabels } from './sidebar';

export const instant = false;

const labels: SidebarLabels = {
  appName: 'AvianDev Admin',
  dashboard: 'Dashboard',
  team: 'Team',
  logout: 'Log out',
  collapse: 'Collapse sidebar',
  expand: 'Expand sidebar',
  navigation: 'Main navigation',
};

const roleLabels = { reader: 'Reader', admin: 'Admin', super_admin: 'Super admin' } as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const collapsed = (await cookies()).get('sidebar')?.value === 'collapsed';

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar
        user={{ name: user.name, role: user.role, roleLabel: roleLabels[user.role] }}
        labels={labels}
        initialCollapsed={collapsed}
      />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}