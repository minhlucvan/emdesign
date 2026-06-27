/**
 * Wrapper around react-doctor's programmatic API.
 *
 * Uses dynamic `import()` to keep react-doctor as a soft dependency — the
 * wrapper degrades gracefully when the package is not installed.
 */
import type { ReactDoctorScanResult, ScanOptions, Finding } from './types.js';

/** Mapping from react-doctor severities to emdesign severities. */
const SEVERITY_MAP: Record<string, 'P0' | 'P1'> = {
  error: 'P0',
  warning: 'P1',
};

const REACT_DOCTOR_PKG = 'react-doctor/api';

/**
 * Run react-doctor's `diagnose()` on a directory and map the results to
 * emdesign's finding format.
 *
 * @returns A `ReactDoctorScanResult` — findings list, score, and raw diagnostics.
 *          If react-doctor is not installed, returns `{ findings: [], score: 1, error: '…' }`.
 */
export async function runReactDoctor(options: ScanOptions): Promise<ReactDoctorScanResult> {
  const { directory, component, warnings = true, includeInfo = false } = options;

  // Dynamically import react-doctor — non-blocking if missing
  let diagnose: (dir: string, opts?: unknown) => Promise<unknown>;
  try {
    const mod = await import(REACT_DOCTOR_PKG);
    diagnose = mod.diagnose;
  } catch (err) {
    return {
      findings: [],
      diagnostics: [],
      score: 1,
      error: `react-doctor not available (${(err as Error).message}). Install it with: npm install react-doctor`,
    };
  }

  try {
    const result = (await diagnose(directory, {
      lint: true,
      warnings,
    })) as {
      diagnostics?: Array<{
        filePath: string;
        plugin: string;
        rule: string;
        severity: string;
        message: string;
        help: string;
        line: number;
        column: number;
        category: string;
        url?: string;
      }>;
      score?: { score?: number; maxScore?: number };
      elapsedMilliseconds?: number;
      project?: { fileCount?: number };
    };

    const rawDiagnostics = result.diagnostics ?? [];

    // Filter to only relevant diagnostics
    let filtered = rawDiagnostics;

    // Filter by component if specified
    if (component) {
      const matcher = component.endsWith('.tsx') ? component : `${component}.tsx`;
      filtered = filtered.filter((d) => d.filePath.endsWith(matcher));
    }

    // Optionally strip info-level
    if (!includeInfo) {
      filtered = filtered.filter((d) => d.severity === 'error' || d.severity === 'warning');
    }

    // Map to emdesign Findings
    const findings: Finding[] = filtered.map((d) => ({
      severity: SEVERITY_MAP[d.severity] ?? 'P1',
      id: d.rule || `react-doctor/${d.category || 'unknown'}`,
      message: `${d.message}${d.filePath ? ` (${d.filePath}:${d.line ?? 0}:${d.column ?? 0})` : ''}`,
      fix: d.help || undefined,
      snippet: d.filePath ? `${d.filePath}:${d.line ?? 0}` : undefined,
    }));

    // Sort P0 first, then P1
    findings.sort((a, b) => (a.severity === 'P0' ? -1 : b.severity === 'P0' ? 1 : 0));

    // Compute a score: start at 1, deduct per finding weight
    const penalty = findings.reduce((sum, f) => {
      return sum + (f.severity === 'P0' ? 0.25 : 0.08);
    }, 0);
    const score = Math.max(0, 1 - penalty);

    return {
      findings,
      diagnostics: filtered,
      score,
      scannedFiles: result.project?.fileCount,
    };
  } catch (err) {
    return {
      findings: [],
      diagnostics: [],
      score: 0.5,
      error: `react-doctor scan failed: ${(err as Error).message}`,
    };
  }
}

/**
 * Check whether react-doctor is installed and importable.
 */
export async function isReactDoctorAvailable(): Promise<boolean> {
  try {
    await import(REACT_DOCTOR_PKG);
    return true;
  } catch {
    return false;
  }
}
