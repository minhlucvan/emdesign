/**
 * Types for @emdesign/plugin-react-doctor — wraps react-doctor's scan results
 * into emdesign's finding format for the agent loop and critique gate.
 */

/** Severity levels matching emdesign's convention (from @emdesign/backend). */
export type FindingSeverity = 'P0' | 'P1' | 'P2';

/** A single finding from the react-doctor scan, shaped like @emdesign/backend's Finding. */
export interface Finding {
  severity: FindingSeverity;
  id: string;
  message: string;
  /** Fix guidance from react-doctor (the `help` field from each diagnostic). */
  fix?: string;
  /** File path + line where the issue was found, used as snippet context. */
  snippet?: string;
}

/** Result of a react-doctor scan via this plugin. */
export interface ReactDoctorScanResult {
  /** Findings mapped to emdesign's format, sorted by severity (P0 first). */
  findings: Finding[];
  /** Raw react-doctor diagnostics (for debugging / detailed reporting). */
  diagnostics: unknown[];
  /** Score (0–1) computed from findings, usable as a `tokens` score in the critique gate. */
  score: number;
  /** Error message if the scan could not be run. */
  error?: string;
  /** How many source files were scanned. */
  scannedFiles?: number;
  /** How many rules were active during the scan. */
  activeRules?: number;
}

/** Options for running a react-doctor scan. */
export interface ScanOptions {
  /** Absolute path to the directory to scan. */
  directory: string;
  /** If set, only report findings that affect this component file name (e.g. "Button.tsx"). */
  component?: string;
  /** Whether to include warnings in the output. Default: true. */
  warnings?: boolean;
  /** Whether to include "info"/advisory diagnostics. Default: false. */
  includeInfo?: boolean;
}
