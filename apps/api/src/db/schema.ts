import { pgTable, pgEnum, serial, text, boolean, timestamp, integer, type AnyPgColumn } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['reader', 'admin', 'super_admin']);
export const userStatus = pgEnum('user_status', ['pending', 'active', 'rejected']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull().default('reader'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  status: userStatus('status').notNull().default('pending'),
  reviewedBy: integer('reviewed_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  published: boolean('published').notNull().default(false),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  role: userRole('role').notNull(),
  invitedBy: integer('invited_by')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});