import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fill, formatDate } from '@aviandev/core/text';
import PostContent from '@/components/post-content';
import { getContentByCMS } from '@/lib/content';
import { getPost, getPosts } from '@/lib/posts';
import { postText } from '../../text';

type Props = { params: Promise<{ slug: string }> };

const ONE_DAY = 24 * 60 * 60 * 1000;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt || undefined };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, text] = await Promise.all([getPost(slug), getContentByCMS('web-post', postText)]);
  if (!post) notFound();

  const wasUpdated =
    post.publishedAt !== null && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > ONE_DAY;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← {text.allPosts}
      </Link>

      <header className="mt-6 space-y-4">
        {post.categories.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-zinc-600">{post.excerpt}</p>}

        <p className="flex flex-wrap gap-x-2 text-sm text-zinc-500">
          {post.authorName && <span>{fill(text.byAuthor, { name: post.authorName })}</span>}
          {post.publishedAt && (
            <span>
              {text.published} <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </span>
          )}
          {wasUpdated && (
            <span>
              {text.updated} <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            </span>
          )}
        </p>
      </header>

      <div className="rich-text post-body mt-10">
        <PostContent doc={post.content} />
      </div>
    </article>
  );
}