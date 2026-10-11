import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/lib/password.js';

describe('password hashing', () => {
  it('never stores the plain password', async () => {
    const hashed = await hashPassword('correct-horse-battery');
    expect(hashed).not.toContain('correct-horse-battery');
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const hashed = await hashPassword('correct-horse-battery');
    expect(await verifyPassword(hashed, 'correct-horse-battery')).toBe(true);
    expect(await verifyPassword(hashed, 'wrong-password')).toBe(false);
  });

  it('gives different hashes for the same password', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
  });
});