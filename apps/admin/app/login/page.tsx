import { getContentByCMS } from '@/lib/content';
import LoginForm from './login-form';
import { loginText } from './text';

export default async function LoginPage() {
  const text = await getContentByCMS('admin-login', loginText);
  return <LoginForm text={text} />;
}