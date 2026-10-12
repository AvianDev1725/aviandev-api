import { loginText } from '../app/login/text';

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
];