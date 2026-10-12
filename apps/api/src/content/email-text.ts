export const emailKeys = {
  newSignup: 'email-new-signup',
  approved: 'email-approved',
  rejected: 'email-rejected',
  invite: 'email-invite',
} as const;

export const emailText = {
  newSignup: {
    subject: 'New admin access request',
    body: '{name} ({email}) has requested admin access to AvianDev.\n\nReview it here: {url}',
  },
  approved: {
    subject: 'Your AvianDev access was approved',
    body: 'Hi {name},\n\nYour request for admin access was approved. You can sign in here: {url}',
  },
  rejected: {
    subject: 'About your AvianDev access request',
    body: "Hi {name},\n\nYour request for admin access to AvianDev wasn't approved.",
  },
  invite: {
    subject: "You're invited to AvianDev Admin",
    body:
      "You've been invited to join AvianDev Admin as {role}.\n\nAccept your invite: {url}\n\n" +
      "This link expires in 48 hours. If you weren't expecting this, you can ignore this email.",
    roleAdmin: 'an admin',
    roleSuperAdmin: 'a super admin',
  },
};