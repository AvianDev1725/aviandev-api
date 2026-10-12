import type { SessionUser } from '../middleware/auth.js';

export function canEditPost(user: SessionUser, post: { authorId: number | null }) {
  return user.role === 'super_admin' || post.authorId === user.id;
}