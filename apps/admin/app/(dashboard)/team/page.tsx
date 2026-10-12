import { redirect } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import InviteForm from './invite-form';
import ReviewButtons from './review-buttons';
import DeleteMemberButton from './delete-member-button';

export const instant = false;

type PendingRequest = { id: number; name: string; email: string; createdAt: string };
type Member = { id: number; name: string; email: string; role: 'admin' | 'super_admin'; createdAt: string };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') redirect('/');

  const pending = (await apiGet<PendingRequest[]>('/users/pending')) ?? [];
  const members = (await apiGet<Member[]>('/users')) ?? [];

  return (
    <div className="max-w-3xl space-y-10">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Team</h1>
          <p className="mt-1 text-zinc-500">Invite people, review access requests and manage members.</p>
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
                    {request.email} · requested {formatDate(request.createdAt)}
                  </p>
                </div>
                <ReviewButtons id={request.id} name={request.name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Members ({members.length})</h2>

        <ul className="divide-y divide-zinc-200 rounded-xl bg-white ring-1 ring-zinc-200">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-zinc-900">
                  {member.name}
                  {member.id === user.id && <span className="ml-2 text-sm font-normal text-zinc-500">(you)</span>}
                </p>
                <p className="text-sm text-zinc-500">
                  {member.email} · {member.role === 'super_admin' ? 'Super admin' : 'Admin'} · joined{' '}
                  {formatDate(member.createdAt)}
                </p>
              </div>
              {member.id !== user.id && <DeleteMemberButton id={member.id} name={member.name} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}