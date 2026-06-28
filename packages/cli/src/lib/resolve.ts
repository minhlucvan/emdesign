import fs from 'node:fs';
import path from 'node:path';
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

/**
 * Resolve the single active design system ID. Reads from emdesign.config.json, falls back to
 * scanning design-systems/, then defaults to 'atelier'. Kept for back-compat; prefer
 * paths.activeDesignSystem directly in new code.
 */
export function activeDsId(store: Store, _paths?: RepoPaths): string {
  // Fast path: if paths provided, use the resolved value
  if (_paths) return _paths.activeDesignSystem;

  // Fall back to state file (written by old versions)
  const cwd = process.cwd();
  try {
    const state = JSON.parse(fs.readFileSync(path.join(cwd, '.emdesign', 'state.json'), 'utf8'));
    if (state.activeDesignSystem) return state.activeDesignSystem;
  } catch { /* no state */ }
  return 'atelier';
}
