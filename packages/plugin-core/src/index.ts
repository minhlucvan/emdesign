/**
 * @emdesign/plugin-core — universal, always-on design-system rules.
 *
 * Aggregates rules from all categories into two hooks:
 *  1. `doctorRules()` — logical DS checks (contract completeness, naming, shadows)
 *  2. `renderedDoctorRules()` — DOM geometry/contrast/color/typography/layout/a11y rules
 *
 * Rule categories:
 *   doctor/       — 6→10 contract rules (spacing, accent, naming, fonts, shadows, etc.)
 *   rendered/     — 7 legacy geometry rules (deprecating in favor of framework charters)
 *   color/        — 5 color rules (off-token text/bg, gradients, surface hierarchy)
 *   typography/   — 4 type rules (line-height, fonts, weights, size limits)
 *   border/       — 3 border rules (radius scale, color tokens, width consistency)
 *   shadow/       — 3 shadow/elevation rules (token declarations, scale, color)
 *   layout/       — 4 layout rules (negative margins, flex vs grid, nesting, centering)
 *   a11y/         — 3 accessibility rules (focus, alt text, heading order)
 *
 * All rules share helpers in ./helpers/index.ts.
 */
import type { MedesignPlugin } from '@emdesign/plugin-api';
import { CORE_DOCTOR_RULES } from './rules/doctor/index.js';
import { CORE_RENDERED_RULES } from './rules/rendered/index.js';
import { CORE_COLOR_RULES } from './rules/color/index.js';
import { CORE_TYPOGRAPHY_RULES } from './rules/typography/index.js';
import { CORE_BORDER_RULES } from './rules/border/index.js';
import { CORE_SHADOW_RULES } from './rules/shadow/index.js';
import { CORE_LAYOUT_RULES } from './rules/layout/index.js';
import { CORE_A11Y_RULES } from './rules/a11y/index.js';

// Re-export all rule arrays for direct import
export { CORE_DOCTOR_RULES } from './rules/doctor/index.js';
export { CORE_RENDERED_RULES } from './rules/rendered/index.js';
export { CORE_COLOR_RULES } from './rules/color/index.js';
export { CORE_TYPOGRAPHY_RULES } from './rules/typography/index.js';
export { CORE_BORDER_RULES } from './rules/border/index.js';
export { CORE_SHADOW_RULES } from './rules/shadow/index.js';
export { CORE_LAYOUT_RULES } from './rules/layout/index.js';
export { CORE_A11Y_RULES } from './rules/a11y/index.js';

// Compose all rendered rules into one array
const ALL_RENDERED_RULES = [
  ...CORE_RENDERED_RULES,
  ...CORE_COLOR_RULES,
  ...CORE_TYPOGRAPHY_RULES,
  ...CORE_BORDER_RULES,
  ...CORE_LAYOUT_RULES,
  ...CORE_A11Y_RULES,
];

// Compose all doctor rules (shadow rules are doctor-level)
const ALL_DOCTOR_RULES = [
  ...CORE_DOCTOR_RULES,
  ...CORE_SHADOW_RULES,
];

export const corePlugin: MedesignPlugin = {
  id: 'core',
  kind: 'styling',
  doctorRules: () => ALL_DOCTOR_RULES,
  renderedDoctorRules: () => ALL_RENDERED_RULES,
};

export default corePlugin;
