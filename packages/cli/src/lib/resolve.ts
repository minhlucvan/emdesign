import type { Store } from '@emdesign/backend';
import type { RepoPaths } from '@emdesign/backend';

const PORT = Number(process.env.EMDESIGN_PORT ?? 4321);
const BASE = process.env.EMDESIGN_BACKEND_URL ?? `http://localhost:${PORT}`;

/**
 * Resolve whether to proxy to a running server or embed the engine.
 * Returns helpers for both paths.
 */
export async function resolveCmd(store: Store, paths: RepoPaths) {
  const running = await serverUp();
  return {
    running,
    proxy: <T>(route: string, body: unknown): Promise<T> =>
      running ? post(route, body) : Promise.reject(new Error('Server not running')),
    embed: <T>(fn: () => T): T => fn(),
  };
}

async function serverUp(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(600) });
    return r.ok;
  } catch {
    return false;
  }
}

async function post<T>(route: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${route} ${r.status}: ${await r.text()}`);
  return r.json() as Promise<T>;
}

export function activeDsId(store: Store): string {
  return store.get().activeDesignSystem ?? 'atelier';
}
