import { getContentByCMS } from '@/lib/content';
import SignupForm from './signup-form';
import { signupText } from './text';

export default async function SignupPage() {
  const text = await getContentByCMS('admin-signup', signupText);
  return <SignupForm text={text} />;
}