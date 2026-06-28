/**
 * Refinement system — snapshot management and activity logging for design-system
 * agent-driven refinement.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface SnapshotManagerOptions {
  baseDir: string;
}

export interface RestoreResult {
  ok: boolean;
  restored?: string[];
  error?: string;
}

export interface ActivityLogEntry {
  instruction: string;
  filesChanged: string[];
  validationResult?: { ok: boolean; note: string };
  timestamp?: string;
}

/**
 * Pre-modification snapshot manager. Copies the system directory to
 * `.snapshots/<timestamp>/` before any change.
 */
export class SnapshotManager {
  private baseDir: string;
  private snapshotsDir: string;
  private recordedCount = 0;

  constructor(opts: SnapshotManagerOptions) {
    this.baseDir = opts.baseDir;
    this.snapshotsDir = path.join(opts.baseDir, '.snapshots');
  }

  /** Record a snapshot of the current system state. Returns the snapshot ID (timestamp). */
  async record(): Promise<string> {
    const timestamp = Date.now().toString();
    const snapDir = path.join(this.snapshotsDir, timestamp);
    fs.mkdirSync(snapDir, { recursive: true });

    this.copyRecursive(this.baseDir, snapDir, ['.snapshots']);
    this.recordedCount++;

    return timestamp;
  }

  /** Return the most recent snapshot ID, or null if none exist (per-instance). */
  latest(): string | null {
    // Only check the filesystem if this instance has recorded something
    if (this.recordedCount === 0) return null;
    try {
      const dirs = fs.readdirSync(this.snapshotsDir)
        .filter(d => fs.statSync(path.join(this.snapshotsDir, d)).isDirectory())
        .sort();
      return dirs.length > 0 ? dirs[dirs.length - 1] : null;
    } catch {
      return null;
    }
  }

  /** Restore the most recent snapshot. */
  async restore(): Promise<RestoreResult> {
    const latest = this.latest();
    if (!latest) {
      return { ok: false, error: 'No snapshot found to revert from.' };
    }

    const snapDir = path.join(this.snapshotsDir, latest);
    const restored: string[] = [];

    this.restoreRecursive(snapDir, this.baseDir, restored);

    return { ok: true, restored };
  }

  private copyRecursive(src: string, dest: string, exclude: string[]): void {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      if (exclude.some(e => srcPath.includes(e))) continue;
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyRecursive(srcPath, destPath, exclude);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private restoreRecursive(src: string, dest: string, restored: string[]): void {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.restoreRecursive(srcPath, destPath, restored);
      } else {
        fs.copyFileSync(srcPath, destPath);
        restored.push(path.relative(dest, destPath));
      }
    }
  }
}

/**
 * Activity logger for refinement operations.
 */
export class ActivityLogger {
  private dsPath: string;
  private logEntries: ActivityLogEntry[] = [];

  constructor(opts: { dsPath: string }) {
    this.dsPath = opts.dsPath;
    // Load existing entries from store
    this.loadExisting();
  }

  /** Log a refinement activity entry. */
  async log(entry: ActivityLogEntry): Promise<void> {
    const enriched: ActivityLogEntry = {
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
    };
    this.logEntries.push(enriched);
    // Persist to disk
    this.persist();
  }

  /** Get all logged entries. */
  entries(): ActivityLogEntry[] {
    return [...this.logEntries];
  }

  private loadExisting(): void {
    const logFile = path.join(this.dsPath, '.refinement-log.json');
    try {
      const data = fs.readFileSync(logFile, 'utf8');
      this.logEntries = JSON.parse(data);
    } catch {
      this.logEntries = [];
    }
  }

  private persist(): void {
    const logFile = path.join(this.dsPath, '.refinement-log.json');
    try {
      fs.writeFileSync(logFile, JSON.stringify(this.logEntries, null, 2));
    } catch {
      // non-fatal
    }
  }
}
