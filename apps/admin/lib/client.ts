type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function postJson<T = unknown>(path: string, body: unknown): Promise<Result<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: data.details?.[0]?.message ?? data.error ?? 'Something went wrong. Please try again.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Could not reach the server. Is the API running?' };
  }
}