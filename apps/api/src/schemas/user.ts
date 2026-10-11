import { z } from 'zod';

export const nameField = z.string().trim().min(1, 'Name is required').max(100);
export const emailField = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email'));
export const passwordField = z.string().min(12, 'Password must be at least 12 characters').max(128);