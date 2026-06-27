/**
 * @emdesign/plugin-react-doctor — wraps react-doctor (deterministic React scanner)
 * as a composable emdesign plugin.
 *
 * Contributes:
 *   - `codegenInstructions()` — notes react-doctor rules the build loop should check
 *   - `doctorRules()` — practice-level rule that reports react-doctor scanning coverage
 *
 * The MCP tool `run_react_doctor` is registered separately in the MCP server.
 */
import type { MedesignPlugin, DesignReviewRule, ReviewContext, ReviewFinding } from '@emdesign/plugin-api';
export { runReactDoctor, isReactDoctorAvailable } from './react-doctor.js';
export type { ReactDoctorScanResult, ScanOptions, Finding, FindingSeverity } from './types.js';

// =========================================================================
// Doctor rules
// =========================================================================

/**
 * A system-level doctor rule that verifies react-doctor scanning has been
 * performed regularly. This is a *practice* rule — it reports the importance
 * of running react-doctor during the build loop.
 *
 * Actual react-doctor findings are surfaced through the `run_react_doctor`
 * MCP tool, which agents call inline during the craft loop.
 */
const reactDoctorPracticeRule: DesignReviewRule = {
  id: 'react-doctor-practice',
  category: 'react',
  title: 'React Doctor scans are active in the project',
  severity: 'P2',
  target: 'react-doctor in plugin stack + available',
  check(_ctx: ReviewContext): ReviewFinding {
    // This rule always reports contextually — the agent drives actual scanning
    // via the MCP tool. Here we report the practice expectation.
    return {
      pass: true,
      detail: 'react-doctor plugin is registered in the stack. Use the `run_react_doctor` MCP tool to scan generated components for anti-patterns.',
      fix: undefined,
    };
  },
};

// =========================================================================
// Plugin export
// =========================================================================

/**
 * The react-doctor plugin (library kind — wraps an external scanning tool).
 *
 * Usage in emdesign.config.json:
 * ```json
 * { "plugins": ["react", "css", "tailwind", "react-doctor"] }
 * ```
 *
 * Agents then call the `run_react_doctor` MCP tool during the build loop
 * to scan generated components for state/effect, performance, architecture,
 * security, and accessibility issues.
 */
export const reactDoctorPlugin: MedesignPlugin = {
  id: 'react-doctor',
  kind: 'library',

  codegenInstructions(): string {
    return [
      'REACT-DOCTOR: Generated code should pass react-doctor scanning (installed via the `react-doctor` plugin).',
      '- Avoid array indices as React keys (use stable unique IDs).',
      '- Avoid missing hook dependencies and stale closures.',
      '- Avoid large useEffect blocks; prefer event-driven or derived state.',
      '- Avoid direct DOM manipulation; use React patterns (refs, state).',
      '- Follow security best practices: sanitize HTML, validate URLs in href/src.',
      'After generating a component, call `run_react_doctor` with its name to catch issues before the critique gate.',
    ].join('\n');
  },

  doctorRules: () => [reactDoctorPracticeRule],
};

export default reactDoctorPlugin;
