import Link from 'next/link';
import { formatDate } from '@aviandev/core/text';
import { getManyByCMS } from '@/lib/content';
import { getPosts } from '@/lib/posts';
import { homeText, siteText } from './text';

export default async function HomePage() {
  const [text, posts] = await Promise.all([
    getManyByCMS({ 'web-site': siteText, 'web-home': homeText }),
    getPosts(),
  ]);
  const site = text['web-site'];
  const home = text['web-home'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{site.siteName}</h1>
      <p className="mt-3 text-lg text-zinc-600">{site.tagline}</p>

      <section aria-labelledby="latest-heading" className="mt-14">
        <h2 id="latest-heading" className="text-xl font-semibold">
          {home.latestPosts}
        </h2>

        {posts.length === 0 ? (
          <p className="mt-4 text-zinc-500">{home.empty}</p>
        ) : (
          <ul className="mt-6 divide-y divide-zinc-200">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="space-y-2 py-6">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt} className="text-sm text-zinc-500">
                      {formatDate(post.publishedAt)}
                    </time>
                  )}
                  <h3 className="text-xl font-semibold tracking-tight">
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt && <p className="text-zinc-600">{post.excerpt}</p>}
                  {post.categories.length > 0 && (
                    <ul className="flex flex-wrap gap-2 pt-1">
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
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}