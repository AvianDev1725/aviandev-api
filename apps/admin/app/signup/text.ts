export const signupText = {
  title: 'Request access',
  subtitle: 'A super admin will review your request',
  nameLabel: 'Name',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  passwordHint: 'At least 12 characters',
  confirmLabel: 'Confirm password',
  submit: 'Request access',
  submitting: 'Sending…',
  missingFields: 'Fill in all fields',
  passwordTooShort: 'Password must be at least 12 characters',
  passwordMismatch: 'Passwords do not match',
  errorFallback: 'Something went wrong. Check your connection and try again.',
  signinPrompt: 'Already have an account?',
  signinLink: 'Sign in',
  sentTitle: 'Request sent',
  sentSubtitle: "You'll be able to sign in once a super admin approves your request.",
  backToSignin: 'Back to sign in',
};

export type SignupText = typeof signupText;