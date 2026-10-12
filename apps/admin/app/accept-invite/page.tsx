import { Suspense } from 'react';
import { getContentByCMS } from '@/lib/content';
import AcceptInviteForm from './accept-invite-form';
import { acceptInviteText } from './text';

export default async function AcceptInvitePage() {
  const text = await getContentByCMS('admin-accept-invite', acceptInviteText);

  return (
    <Suspense fallback={null}>
      <AcceptInviteForm text={text} />
    </Suspense>
  );
}