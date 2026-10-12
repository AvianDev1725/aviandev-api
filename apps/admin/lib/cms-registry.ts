import { loginText } from '../app/login/text';
import { signupText } from '../app/signup/text';
import { acceptInviteText } from '../app/accept-invite/text';
import { dashboardText, shellText } from '../app/(dashboard)/text';

export type CmsEntry = {
  key: string;
  name: string;
  description: string;
  fallback: Record<string, string>;
};

export const cmsRegistry: CmsEntry[] = [
  {
    key: 'admin-login',
    name: 'Admin: sign in page',
    description: 'Text on the admin sign in page.',
    fallback: loginText,
  },
  {
    key: 'admin-signup',
    name: 'Admin: request access page',
    description: 'The signup form and its confirmation message.',
    fallback: signupText,
  },
  {
    key: 'admin-accept-invite',
    name: 'Admin: accept invite page',
    description: 'The page an invited person uses to create their account.',
    fallback: acceptInviteText,
  },
  {
    key: 'admin-shell',
    name: 'Admin: sidebar',
    description: 'Navigation, role names and buttons in the sidebar.',
    fallback: shellText,
  },
  {
    key: 'admin-dashboard',
    name: 'Admin: dashboard home',
    description: 'The first page after signing in. {name} is replaced with the person’s name.',
    fallback: dashboardText,
  },
];