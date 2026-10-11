import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { verifyPassword } from '../src/lib/password.js';

const rl = createInterface({ input, output });
const email = (await rl.question('Email: ')).trim().toLowerCase();
const password = await rl.question('Password: ');
rl.close();

const [user] = await db.select().from(users).where(eq(users.email, email));

if (!user) {
  console.log('No account with that email.');
} else {
  const ok = await verifyPassword(user.passwordHash, password);
  console.log(ok ? `Password correct ✅ (role: ${user.role}, status: ${user.status})` : 'Password wrong ❌');
}