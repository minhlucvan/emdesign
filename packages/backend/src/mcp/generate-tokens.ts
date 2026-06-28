/**
 * MCP tool: generate-tokens
 *
 * Parses DESIGN.md color/typography/spacing values and produces a complete
 * tokens.css with all semantic token roles.
 */

import { SEMANTIC_TOKEN_ROLES } from '@emdesign/dsr';

export interface GenerateTokensInput {
  designMd: string;
}

/** Extract CSS variable declarations from markdown content. */
function extractCssVars(md: string): Map<string, string> {
  const vars = new Map<string, string>();
  // Match CSS variable declarations like `--name: value;`
  const re = /--([\w-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    vars.set(m[1], m[2].trim());
  }
  return vars;
}

/** Generate a complete tokens.css that covers all SEMANTIC_TOKEN_ROLES plus extras from DESIGN.md. */
export async function generateTokens(input: GenerateTokensInput): Promise<string> {
  const { designMd } = input;
  const extracted = extractCssVars(designMd);

  const lines: string[] = [
    '/* Generated tokens.css — do not edit manually */',
    ':root {',
  ];

  // Include all SEMANTIC_TOKEN_ROLES with defaults
  for (const role of SEMANTIC_TOKEN_ROLES) {
    const value = extracted.get(role) || defaultFor(role);
    lines.push(`  --${role}: ${value};`);
  }

  // Include any extra roles found in the DESIGN.md not covered by SEMANTIC_TOKEN_ROLES
  for (const [role, value] of extracted) {
    if (!SEMANTIC_TOKEN_ROLES.includes(role as any)) {
      lines.push(`  --${role}: ${value};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

function defaultFor(role: string): string {
  const defaults: Record<string, string> = {
    'color-surface': '#ffffff',
    'color-surface-raised': '#f7f7f8',
    'color-text': '#18181b',
    'color-text-muted': '#6b7280',
    'color-accent': '#2563eb',
    'color-accent-hover': '#1d4ed8',
    'color-border': '#e5e7eb',
    'radius': '8px',
    'space-unit': '8px',
    'font-sans': '"Inter", system-ui, sans-serif',
    'shadow-raised': '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
  };
  return defaults[role] || '#000000';
}
