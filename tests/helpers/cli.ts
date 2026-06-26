/**
 * CLI test helper — runs `npx tsx packages/cli/src/cli.ts <args>`.
 *
 * Uses tsx + source TypeScript directly (same as `npm run backend` in dev).
 * There is no fallback: if tsx isn't available the test fails — that's correct.
 */
import { execSync, spawn } from 'child_process';
import { resolve } from 'path';

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/** Absolute path to the CLI entry point. */
const CLI_SRC = resolve(import.meta.dirname, '../../packages/cli/src/cli.ts');

/**
 * Run `npx tsx <cli.ts> <args...>` and return the result.
 *
 * Always uses tsx so tests work in dev without a build step.
 * `cwd` defaults to a temp directory — tests should set it explicitly.
 */
export async function runEmdesign(
  args: string[],
  options?: { cwd?: string; timeout?: number },
): Promise<CliResult> {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn('npx', ['tsx', CLI_SRC, ...args], {
      cwd: options?.cwd ?? process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, CI: '1', NO_COLOR: '1', EMDESIGN_PORT: process.env.EMDESIGN_PORT ?? '4321' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    const timer = options?.timeout
      ? setTimeout(() => {
          proc.kill();
          reject(new Error(`CLI timed out after ${options.timeout}ms: emdesign ${args.join(' ')}`));
        }, options.timeout)
      : null;

    proc.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolvePromise({ exitCode: code ?? -1, stdout, stderr });
    });
    proc.on('error', reject);
  });
}

export async function expectSuccess(
  result: CliResult,
  message?: string,
): Promise<void> {
  if (result.exitCode !== 0) {
    throw new Error(
      message ??
        `Expected exit 0, got ${result.exitCode}\n  stderr: ${result.stderr.slice(0, 300)}`,
    );
  }
}
