import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { hashPassword } from '../src/lib/password.js';

const rl = createInterface({ input, output });
const name = (await rl.question('Name: ')).trim();
const email = (await rl.question('Email: ')).trim().toLowerCase();
const password = await rl.question('Password (at least 6 characters): ');
rl.close();

if (!name || !email || password.length < 6) {
  console.error('Name and email are required, and the password must be at least 6 characters.');
  process.exit(1);
}

const [user] = await db
  .insert(users)
  .values({ name, email, passwordHash: await hashPassword(password), role: 'super_admin', status: 'active' })
  .returning({ id: users.id, email: users.email, role: users.role });

console.log('Created:', user);