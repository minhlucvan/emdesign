/**
 * MCP tool: generate-design-md
 *
 * Produces a complete 9-section DESIGN.md from an analysis result (or from
 * a DESIGN.md upload for stage 2 of the from-design-md flow).
 */

export interface GenerateDesignMdInput {
  analysis: {
    mood: string;
    category: string;
    keywords: string[];
    accentColor?: string;
    fonts?: Record<string, string>;
  };
  baseRef?: string;
}

const SECTION_TEMPLATES: Record<string, string> = {
  'Visual Theme & Atmosphere': (
    mood: string, accent: string
  ) => `The system evokes a ${mood} atmosphere.
The foundational palette centers on the accent and balanced neutrals.

Key visual attributes:
- Primary accent: ${accent || '#2563eb'}
- Light mode: clean white and near-white surfaces
- Dark mode: deep charcoal or near-black backgrounds
- Mood: ${mood}`,

  Color: (
    accent: string
  ) => `--color-surface: #ffffff;
--color-surface-raised: #f7f7f8;
--color-text: #18181b;
--color-text-muted: #6b7280;
--color-accent: ${accent || '#2563eb'};
--color-accent-hover: ${adjustHex(accent || '#2563eb', -20)};
--color-border: #e5e7eb;
--color-success: #15803d;
--color-warn: #b45309;
--color-danger: #b91c1c;`,

  Typography: (
    displayFont: string, bodyFont: string
  ) => `| Role       | Family           | Weight | Size   | Line Height | Letter Spacing |
|------------|------------------|--------|--------|-------------|----------------|
| Display    | "${displayFont}", system-ui, sans-serif | 700    | 36px   | 1.2         | -0.02em        |
| Heading    | "${displayFont}", system-ui, sans-serif | 600    | 24px   | 1.3         | -0.01em        |
| Subheading | "${bodyFont}", system-ui, sans-serif     | 500    | 18px   | 1.4         | 0              |
| Body       | "${bodyFont}", system-ui, sans-serif     | 400    | 16px   | 1.5         | 0              |
| Small      | "${bodyFont}", system-ui, sans-serif     | 400    | 14px   | 1.5         | 0              |
| Caption    | "${bodyFont}", system-ui, sans-serif     | 400    | 12px   | 1.4         | 0.01em         |
| Mono       | "JetBrains Mono", monospace              | 400    | 14px   | 1.5         | 0              |`,

  Spacing: () => `Base unit: 8px
Scale: 2px, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
Padding: 16px (containers), 8px (inline)
Gap: 8px (tight), 16px (comfortable), 24px (loose)
Section Y: 96px`,

  'Layout & Composition': () => `Grid: 12-column fluid grid
Container max: 1180px
Gutter: 24px
Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
Whitespace: generous, with clear vertical rhythm`,

  Components: () => `Button — primary, secondary, ghost, danger states with hover/active/focus/disabled
Card — default, interactive, elevated variants
Input — text, search, number with focus/error/disabled states
Badge — neutral, accent, success, warn, danger
Heading — h1-h6 with page-title and section-title variants
Text — body, body-sm, label, code, mono`,

  'Motion & Interaction': () => `Duration fast: 120ms
Duration base: 220ms
Ease standard: cubic-bezier(0.2, 0, 0, 1)
Ease enter: cubic-bezier(0, 0, 0.2, 1)
Ease exit: cubic-bezier(0.4, 0, 1, 1)
What animates: hover, focus, enter/exit, layout shifts
What must not: critical UI (save/delete buttons), error states`,

  'Voice & Brand': () => `Tone: professional yet approachable
Copy rules: clear, concise, action-oriented; avoid jargon
The brand is not: overly casual, dismissive, or verbose`,

  'Anti-patterns': () => `DO: use semantic tokens for all colors
DO: maintain consistent spacing rhythm
DON'T: apply accent to large surface areas (overuse)
DON'T: hardcode colors outside tokens.css
DON'T: use emoji as icons
DON'T: invent metrics without data backing`,
};

function adjustHex(hex: string, amount: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Generate a complete 9-section DESIGN.md from analysis input. */
export async function generateDesignMd(input: GenerateDesignMdInput): Promise<string> {
  const { analysis, baseRef } = input;
  const name = (analysis.keywords[0] || 'Design System')
    .replace(/(?:^|\s)\S/g, c => c.toUpperCase().trim());
  const displayFont = analysis.fonts?.display || 'Inter';
  const bodyFont = analysis.fonts?.body || 'Inter';
  const accent = analysis.accentColor;

  const sections = [
    `# ${name}
> Category: ${analysis.category}
> Surface: web

${analysis.mood}.`,
    `## 1. Visual Theme & Atmosphere\n${SECTION_TEMPLATES['Visual Theme & Atmosphere'](analysis.mood, accent)}`,
    `## 2. Color\n${SECTION_TEMPLATES.Color(accent)}`,
    `## 3. Typography\n${SECTION_TEMPLATES.Typography(displayFont, bodyFont)}`,
    `## 4. Spacing\n${SECTION_TEMPLATES.Spacing()}`,
    `## 5. Layout & Composition\n${SECTION_TEMPLATES['Layout & Composition']()}`,
    `## 6. Components\n${SECTION_TEMPLATES.Components()}`,
    `## 7. Motion & Interaction\n${SECTION_TEMPLATES['Motion & Interaction']()}`,
    `## 8. Voice & Brand\n${SECTION_TEMPLATES['Voice & Brand']()}`,
    `## 9. Anti-patterns\n${SECTION_TEMPLATES['Anti-patterns']()}`,
    '## 10. Tokens\nSee `tokens.css` for the machine contract.',
  ];

  if (baseRef) {
    sections.push(`\n_Based on: ${baseRef}_`);
  }

  return sections.join('\n\n');
}
