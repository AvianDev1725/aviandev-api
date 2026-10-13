import { loginText } from '../app/login/text';
import { signupText } from '../app/signup/text';
import { acceptInviteText } from '../app/accept-invite/text';
import { dashboardText, shellText } from '../app/(dashboard)/text';
import { teamText } from '../app/(dashboard)/team/text';
import { modelsText } from '../app/(dashboard)/models/text';
import { contentText, richTextText } from '../app/(dashboard)/content/text';
import { emailKeys, emailText } from '../../api/src/content/email-text';
import { categoriesText } from '../app/(dashboard)/categories/text';
import { postsText } from '../app/(dashboard)/posts/text';

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
  {
    key: 'admin-team',
    name: 'Admin: team page',
    description: 'Invites, access requests and members. Placeholders: {email}, {count}, {date}, {name}.',
    fallback: teamText,
  },
  {
    key: 'admin-models',
    name: 'Admin: content models',
    description: 'The model list and the drag-and-drop model builder.',
    fallback: modelsText,
  },
  {
    key: 'admin-content',
    name: 'Admin: content',
    description: 'The content list and the content editor.',
    fallback: contentText,
  },
  {
    key: 'admin-rich-text',
    name: 'Admin: rich text toolbar',
    description: 'Button names in the rich text editor toolbar.',
    fallback: richTextText,
  },
  {
    key: emailKeys.newSignup,
    name: 'Email: new access request',
    description: 'Sent to super admins. Placeholders: {name}, {email}, {url}.',
    fallback: emailText.newSignup,
  },
  {
    key: emailKeys.approved,
    name: 'Email: access approved',
    description: 'Placeholders: {name}, {url}.',
    fallback: emailText.approved,
  },
  {
    key: emailKeys.rejected,
    name: 'Email: access rejected',
    description: 'Placeholders: {name}.',
    fallback: emailText.rejected,
  },
  {
    key: emailKeys.invite,
    name: 'Email: invitation',
    description: 'Placeholders: {role}, {url}. Role wording comes from the two role fields.',
    fallback: emailText.invite,
  },
  {
    key: 'admin-categories',
    name: 'Admin: categories page',
    description: 'Adding, editing and deleting categories. Placeholders: {count}, {name}.',
    fallback: categoriesText,
  },
  {
    key: 'admin-posts',
    name: 'Admin: posts list',
    description: 'The list of posts, with filters and statuses. Placeholders: {count}, {date}, {name}, {title}.',
    fallback: postsText,
  },
];