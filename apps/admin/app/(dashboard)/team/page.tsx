import { redirect } from 'next/navigation';
import { apiGet, getCurrentUser } from '@/lib/api';
import { getContentByCMS } from '@/lib/content';
import { fill } from '@/lib/text';
import InviteForm from './invite-form';
import ReviewButtons from './review-buttons';
import DeleteMemberButton from './delete-member-button';
import { teamText } from './text';

export const instant = false;

type PendingRequest = { id: number; name: string; email: string; createdAt: string };
type Member = { id: number; name: string; email: string; role: 'admin' | 'super_admin'; createdAt: string };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') redirect('/');

  const [text, pending, members] = await Promise.all([
    getContentByCMS('admin-team', teamText),
    apiGet<PendingRequest[]>('/users/pending').then((list) => list ?? []),
    apiGet<Member[]>('/users').then((list) => list ?? []),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{text.title}</h1>
          <p className="mt-1 text-zinc-500">{text.subtitle}</p>
        </div>
        <InviteForm text={text} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{fill(text.pendingHeading, { count: pending.length })}</h2>
        {pending.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-zinc-500 ring-1 ring-zinc-200">{text.pendingEmpty}</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl bg-white ring-1 ring-zinc-200">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-zinc-900">{request.name}</p>
                  <p className="text-sm text-zinc-500">
                    {request.email} · {fill(text.requestedOn, { date: formatDate(request.createdAt) })}
                  </p>
                </div>
                <ReviewButtons id={request.id} name={request.name} text={text} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{fill(text.membersHeading, { count: members.length })}</h2>
        <ul className="divide-y divide-zinc-200 rounded-xl bg-white ring-1 ring-zinc-200">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-zinc-900">
                  {member.name}
                  {member.id === user.id && <span className="ml-2 text-sm font-normal text-zinc-500">{text.you}</span>}
                </p>
                <p className="text-sm text-zinc-500">
                  {member.email} · {member.role === 'super_admin' ? text.roleSuperAdmin : text.roleAdmin} ·{' '}
                  {fill(text.joinedOn, { date: formatDate(member.createdAt) })}
                </p>
              </div>
              {member.id !== user.id && <DeleteMemberButton id={member.id} name={member.name} text={text} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}