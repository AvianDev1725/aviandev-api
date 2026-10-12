import { Resend } from 'resend';

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

export const emails = {
  newSignup: (name: string, email: string) => ({
    subject: 'New admin access request',
    text: `${name} (${email}) has requested admin access to AvianDev.\n\nReview it here: ${adminUrl()}/team`,
  }),

  approved: (name: string) => ({
    subject: 'Your AvianDev access was approved',
    text: `Hi ${name},\n\nYour request for admin access was approved. You can sign in here: ${adminUrl()}/login`,
  }),

  rejected: (name: string) => ({
    subject: 'About your AvianDev access request',
    text: `Hi ${name},\n\nYour request for admin access to AvianDev wasn't approved.`,
  }),

  invite: (inviteUrl: string, role: 'admin' | 'super_admin') => ({
    subject: "You're invited to AvianDev Admin",
    text:
      `You've been invited to join AvianDev Admin as ${role === 'super_admin' ? 'a super admin' : 'an admin'}.\n\n` +
      `Accept your invite: ${inviteUrl}\n\n` +
      `This link expires in 48 hours. If you weren't expecting this, you can ignore this email.`,
  }),
};