import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { posts } from '../db/schema.js';

export type NewPost = typeof posts.$inferInsert;

export async function getPublishedPosts() {
  return db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt));
}

export async function getPublishedPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)));
  return post;
}

export async function getPostById(id: number) {
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  return post;
}

export async function createPost(input: NewPost) {
  const [post] = await db
    .insert(posts)
    .values({ ...input, publishedAt: input.published ? new Date() : null })
    .returning();
  return post;
}

export async function updatePost(id: number, input: Partial<NewPost>) {
  const [post] = await db
    .update(posts)
    .set({
      ...input,
      ...(input.published === true && { publishedAt: sql`coalesce(${posts.publishedAt}, now())` }),
    })
    .where(eq(posts.id, id))
    .returning();
  return post;
}

export async function deletePost(id: number) {
  const [post] = await db.delete(posts).where(eq(posts.id, id)).returning();
  return post;
}