import { redirect } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import InviteForm from './invite-form';
import ReviewButtons from './review-buttons';

export const instant = false;

type PendingRequest = { id: number; name: string; email: string; createdAt: string };

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'super_admin') redirect('/');

  const pending = (await apiGet<PendingRequest[]>('/users/pending')) ?? [];

  return (
    <div className="max-w-3xl space-y-10">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Team</h1>
          <p className="mt-1 text-zinc-500">Invite people and review access requests.</p>
        </div>
        <InviteForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Pending requests ({pending.length})</h2>

        {pending.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-zinc-500 ring-1 ring-zinc-200">
            No pending requests.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl bg-white ring-1 ring-zinc-200">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-zinc-900">{request.name}</p>
                  <p className="text-sm text-zinc-500">
                    {request.email} · requested{' '}
                    {new Date(request.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <ReviewButtons id={request.id} name={request.name} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}