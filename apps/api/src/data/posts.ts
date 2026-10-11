import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { posts } from '../db/schema.js';

export type NewPost = typeof posts.$inferInsert;

export async function getPublishedPosts() {
  return db.select().from(posts).where(eq(posts.published, true));
}

export async function getPublishedPostBySlug(slug: string) {
  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)));
  return result[0];
}

export async function createPost(input: NewPost) {
  const result = await db.insert(posts).values(input).returning();
  return result[0];
}

export async function updatePost(id: number, input: Partial<NewPost>) {
  const result = await db
    .update(posts)
    .set(input)
    .where(eq(posts.id, id))
    .returning();
  return result[0];
}

export async function deletePost(id: number) {
  const result = await db.delete(posts).where(eq(posts.id, id)).returning();
  return result[0];
}