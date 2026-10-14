export function notifyChanged(tags: string[]) {
  const urls = (process.env.REVALIDATE_URLS ?? '').split(',').map((url) => url.trim()).filter(Boolean);
  const secret = process.env.REVALIDATE_SECRET;
  const unique = [...new Set(tags)];
  if (unique.length === 0 || urls.length === 0 || !secret || process.env.NODE_ENV === 'test') return;

  const body = JSON.stringify({ tags: unique });
  for (const url of urls) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body,
    }).catch((err) => console.error('[revalidate failed]', url, err));
  }
}

export function notifyContentChanged(keys: string[]) {
  notifyChanged(keys.map((key) => `content:${key}`));
}

export function notifyPostsChanged(slugs: string[]) {
  notifyChanged(['posts', ...slugs.map((slug) => `post:${slug}`)]);
}

export function notifyCategoriesChanged(slugs: string[]) {
  notifyChanged(['categories', ...slugs.map((slug) => `category:${slug}`)]);
}