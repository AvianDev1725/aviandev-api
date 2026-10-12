import { Resend } from 'resend';
import { emailKeys, emailText } from '../content/email-text.js';
import { getText } from './content.js';

type Email = { to: string | string[]; subject: string; text: string };

export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || process.env.NODE_ENV === 'test') {
    console.log(`[email not sent] To: ${email.to}\nSubject: ${email.subject}\n${email.text}\n`);
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'AvianDev <onboarding@resend.dev>',
      ...email,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[email failed]', err);
    return false;
  }
}

const adminUrl = () => process.env.ADMIN_URL ?? 'http://localhost:3001';

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(values, key) ? values[key] : match));
}

export const emails = {
  async newSignup(name: string, email: string) {
    const t = await getText(emailKeys.newSignup, emailText.newSignup);
    return { subject: fill(t.subject, { name }), text: fill(t.body, { name, email, url: `${adminUrl()}/team` }) };
  },

  async approved(name: string) {
    const t = await getText(emailKeys.approved, emailText.approved);
    return { subject: fill(t.subject, { name }), text: fill(t.body, { name, url: `${adminUrl()}/login` }) };
  },

  async rejected(name: string) {
    const t = await getText(emailKeys.rejected, emailText.rejected);
    return { subject: fill(t.subject, { name }), text: fill(t.body, { name }) };
  },

  async invite(inviteUrl: string, role: 'admin' | 'super_admin') {
    const t = await getText(emailKeys.invite, emailText.invite);
    const roleText = role === 'super_admin' ? t.roleSuperAdmin : t.roleAdmin;
    return { subject: t.subject, text: fill(t.body, { role: roleText, url: inviteUrl }) };
  },
};