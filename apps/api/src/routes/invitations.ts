import { Hono } from 'hono';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { invitations, users } from '../db/schema.js';
import { requireAuth, requireRole, type AuthEnv } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { validateJson } from '../lib/validate.js';
import { hashPassword } from '../lib/password.js';
import { generateToken, hashToken } from '../lib/token.js';
import { nameField, emailField, passwordField } from '../schemas/user.js';
import { sendEmail, emails } from '../lib/email.js';

const INVITE_HOURS = 48;
const ADMIN_URL = process.env.ADMIN_URL ?? 'http://localhost:3001';

const createInviteSchema = z.object({
  email: emailField,
  role: z.enum(['admin', 'super_admin']),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: nameField,
  password: passwordField,
});

async function findUserByEmail(email: string) {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return user;
}

const invitationsRoute = new Hono<AuthEnv>();

invitationsRoute.post(
  '/',
  requireAuth,
  requireRole('super_admin'),
  validateJson(createInviteSchema),
  async (c) => {
    const { email, role } = c.req.valid('json');
    if (await findUserByEmail(email)) {
      return c.json({ error: 'A user with this email already exists' }, 409);
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + INVITE_HOURS * 60 * 60 * 1000);
    await db.insert(invitations).values({
      id: hashToken(token),
      email,
      role,
      invitedBy: c.get('user').id,
      expiresAt,
    });

    const inviteUrl = `${ADMIN_URL}/accept-invite?token=${token}`;
    const emailSent = await sendEmail({ to: email, ...(await emails.invite(inviteUrl, role)) });
    return c.json({ email, role, expiresAt, inviteUrl, emailSent }, 201);
  }
);

invitationsRoute.post(
  '/accept',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  validateJson(acceptInviteSchema),
  async (c) => {
    const { token, name, password } = c.req.valid('json');
    const passwordHash = await hashPassword(password);

    const [invite] = await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(
        and(
          eq(invitations.id, hashToken(token)),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date())
        )
      )
      .returning();

    if (!invite) {
      return c.json({ error: 'This invite link is invalid or has expired' }, 400);
    }
    if (await findUserByEmail(invite.email)) {
      return c.json({ error: 'An account with this email already exists' }, 409);
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email: invite.email,
        passwordHash,
        role: invite.role,
        status: 'active',
        reviewedBy: invite.invitedBy,
        reviewedAt: new Date(),
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    return c.json({ user }, 201);
  }
);

export default invitationsRoute;