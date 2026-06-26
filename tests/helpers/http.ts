/**
 * HTTP test helper — calls the backend's REST API.
 *
 * Requires the backend on EMDESIGN_PORT (default 4321).
 * Tests fail loudly if the backend isn't running (no silent skip).
 */

const BASE = `http://localhost:${process.env.EMDESIGN_PORT ?? '4321'}`;

export async function apiGet<T>(path: string, timeout = 5_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${path} returned ${res.status}: ${await res.text().catch(() => '(empty)')}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiPost<T>(path: string, body: unknown, timeout = 10_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`${path} returned ${res.status}: ${await res.text().catch(() => '(empty)')}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}
