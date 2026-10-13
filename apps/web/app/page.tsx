import { getManyByCMS } from '@/lib/content';
import { homeText, siteText } from './text';

export default async function HomePage() {
  const text = await getManyByCMS({ 'web-site': siteText, 'web-home': homeText });
  const site = text['web-site'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{site.siteName}</h1>
      <p className="mt-3 text-lg text-zinc-600">{site.tagline}</p>
      <h2 className="mt-12 text-xl font-semibold">{text['web-home'].latestPosts}</h2>
    </div>
  );
}