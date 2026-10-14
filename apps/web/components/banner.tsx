import Link from 'next/link';
import { isSafeLink } from '@aviandev/core/text';
import type { homeBanner } from '@/app/text';

export default function Banner({ banner }: { banner: typeof homeBanner }) {
  const hasImage = banner.image !== '' && isSafeLink(banner.image);
  const hasButton = banner.showButton && banner.linkLabel !== '' && isSafeLink(banner.link);
  const buttonClass =
    'inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900';

  return (
    <section aria-labelledby="banner-title" className="space-y-8">
      <div className="space-y-4">
        <h1 id="banner-title" className="text-4xl font-bold tracking-tight sm:text-5xl">
          {banner.title}
        </h1>
        {banner.subtitle && <p className="text-lg text-zinc-600">{banner.subtitle}</p>}
        {banner.body && <div className="rich-text text-zinc-700" dangerouslySetInnerHTML={{ __html: banner.body }} />}
        {hasButton &&
          (banner.link.startsWith('/') ? (
            <Link href={banner.link} className={buttonClass}>
              {banner.linkLabel}
            </Link>
          ) : (
            <a href={banner.link} rel="noopener noreferrer" className={buttonClass}>
              {banner.linkLabel}
            </a>
          ))}
      </div>

      {hasImage && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt={banner.imageAlt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}
    </section>
  );
}