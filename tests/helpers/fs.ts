import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export function assertFileExists(base: string, ...pathSegments: string[]): string {
  const fullPath = join(base, ...pathSegments);
  if (!existsSync(fullPath)) throw new Error(`File not found: ${fullPath}`);
  const s = statSync(fullPath);
  if (!s.isFile()) throw new Error(`Not a file: ${fullPath}`);
  return fullPath;
}

export function assertDirExists(base: string, ...pathSegments: string[]): string {
  const fullPath = join(base, ...pathSegments);
  if (!existsSync(fullPath)) throw new Error(`Dir not found: ${fullPath}`);
  const s = statSync(fullPath);
  if (!s.isDirectory()) throw new Error(`Not a directory: ${fullPath}`);
  return fullPath;
}

export function assertFileContains(base: string, filePath: string, substring: string): void {
  const full = assertFileExists(base, filePath);
  const content = readFileSync(full, 'utf-8');
  if (!content.includes(substring)) {
    throw new Error(`"${filePath}" should contain "${substring}"` +
      `\n  got: ${content.slice(0, 200).replace(/\n/g, '\\n')}...`);
  }
}

export function assertFileMissing(base: string, ...pathSegments: string[]): void {
  const fullPath = join(base, ...pathSegments);
  if (existsSync(fullPath)) throw new Error(`Expected file to be missing: ${fullPath}`);
}

export function readFile(base: string, ...pathSegments: string[]): string {
  return readFileSync(join(base, ...pathSegments), 'utf-8');
}

export function tmpDir(prefix = 'emdesign-test-'): string {
  const dir = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}
