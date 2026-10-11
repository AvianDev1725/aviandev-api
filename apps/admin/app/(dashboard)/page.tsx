import { getCurrentUser } from '@/lib/api';

export const instant = false;

export default async function DashboardHome() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Welcome back, {user?.name}</h1>
      <p className="mt-1 text-zinc-500">Your posts and tools will appear here.</p>
    </div>
  );
}