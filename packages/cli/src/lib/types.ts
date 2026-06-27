/** Base CLI response wrapper for JSON output. */
export interface CliResponse<T = unknown> {
  ok: boolean;
  data: T;
  meta?: {
    took?: number;           // wall-clock ms
    warnings?: string[];
    gate?: 'pass' | 'fail';  // only when --gate is set
  };
}

/** Error response for CLI commands. */
export interface CliError {
  ok: false;
  error: string;
  meta?: { took?: number };
}

/** Doctor-specific result shape. */
export interface DoctorResult {
  component: string;
  kinds: string[];
  scores: Record<string, number>;
  composite: number;
  mustFix: number;
  decision: 'ship' | 'revise' | 'continue';
  findings: DoctorFinding[];
}

export interface DoctorFinding {
  kind: string;
  severity: 'P0' | 'P1' | 'P2';
  message: string;
  target?: string;
  remediation?: string;
}
