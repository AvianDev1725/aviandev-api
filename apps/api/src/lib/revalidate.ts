export function notifyContentChanged(keys: string[]) {
  const urls = (process.env.REVALIDATE_URLS ?? '').split(',').map((url) => url.trim()).filter(Boolean);
  const secret = process.env.REVALIDATE_SECRET;
  if (keys.length === 0 || urls.length === 0 || !secret || process.env.NODE_ENV === 'test') return;

  const body = JSON.stringify({ tags: keys.map((key) => `content:${key}`) });
  for (const url of urls) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body,
    }).catch((err) => console.error('[revalidate failed]', url, err));
  }
}