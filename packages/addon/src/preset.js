/**
 * Storybook preset entry for @emdesign/addon.
 * - managerEntries → the panel (manager UI); the manager builder resolves bare specifiers.
 * - previewAnnotations → the in-iframe overlay (point-to-element commenting). The Vite preview
 *   builder needs an ABSOLUTE path here (a bare specifier gets mangled to a root URL → 404), so we
 *   resolve it via createRequire.
 *
 * Side effect on import: auto-launches the emdesign backend alongside Storybook if not already running.
 * Referenced from a project's .storybook/main.ts via the addon name "@emdesign/addon".
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Auto-launch backend
// ---------------------------------------------------------------------------

/**
 * Check if a port is in use by attempting a TCP connection.
 */
function portInUse(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(true));
    srv.once('listening', () => { srv.close(); resolve(false); });
    srv.listen(port);
  });
}

/**
 * Resolve the CLI entry point — try the compiled dist first, fall back to tsx source.
 */
function resolveCli() {
  // Relative to this file (packages/addon/src/preset.js)
  const candidates = [
    path.resolve(here, '../../cli/dist/cli.js'),
    path.resolve(here, '../../cli/src/cli.ts'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Start the emdesign backend if it isn't already running on :4321.
 * Called as a side-effect when Storybook loads this preset.
 */
async function ensureBackend() {
  const PORT = Number(process.env.EMDESIGN_PORT ?? 4321);
  try {
    // Check if backend is already running
    const busy = await portInUse(PORT);
    if (!busy) {
      const cliPath = resolveCli();
      if (!cliPath) {
        console.error('[emdesign] CLI not found — backend auto-start skipped');
        return;
      }

      const isTs = cliPath.endsWith('.ts');
      const child = isTs
        ? spawn('npx', ['tsx', cliPath, 'serve', '--port', String(PORT)], {
            cwd: process.cwd(),
            stdio: 'pipe',
            env: { ...process.env },
          })
        : spawn(process.execPath, [cliPath, 'serve', '--port', String(PORT)], {
            cwd: process.cwd(),
            stdio: 'pipe',
            env: { ...process.env },
          });

      child.stdout?.on('data', (d) => process.stderr.write(`[emdesign-backend] ${d}`));
      child.stderr?.on('data', (d) => process.stderr.write(`[emdesign-backend] ${d}`));
      child.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          process.stderr.write(`[emdesign] Backend exited with code ${code}\n`);
        }
      });

      // Cleanup on Storybook exit
      const kill = () => { try { child.kill(); } catch { /* already dead */ }};
      process.on('exit', kill);
      process.on('SIGINT', () => { kill(); process.exit(); });
      process.on('SIGTERM', () => { kill(); process.exit(); });

      // Give it a moment to start
      await new Promise((r) => setTimeout(r, 2000));
      console.error(`[emdesign] Backend auto-started on :${PORT}`);
    }
  } catch (e) {
    // Don't crash Storybook if backend fails to start
    console.error('[emdesign] Backend auto-start skipped:', e.message);
  }
}

// Fire-and-forget: don't block Storybook startup
ensureBackend();

// ---------------------------------------------------------------------------
// Preset hooks
// ---------------------------------------------------------------------------

export function managerEntries(entry = []) {
  return [...entry, '@emdesign/addon/manager'];
}

export function previewAnnotations(entry = []) {
  return [...entry, require.resolve('@emdesign/addon/preview')];
}
