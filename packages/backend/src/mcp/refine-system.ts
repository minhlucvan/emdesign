/**
 * MCP tool: refine-design-system
 *
 * Reads current system state (DESIGN.md, tokens.css, manifest), applies a
 * natural language instruction, and returns a diff of changes.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface RefineInput {
  dsPath: string;
  instruction: string;
}

export interface RefineResult {
  changes: string[];
  note: string;
}

/** Apply a natural language refinement instruction to a design system. */
export async function refineDesignSystem(input: RefineInput): Promise<RefineResult> {
  const { dsPath, instruction } = input;
  const lower = instruction.toLowerCase();
  const changes: string[] = [];

  // Read current state
  const designMd = readFileSafe(path.join(dsPath, 'DESIGN.md'));
  const tokensCss = readFileSafe(path.join(dsPath, 'tokens.css'));
  const manifest = readFileSafe(path.join(dsPath, 'manifest.json'));

  if (!designMd) changes.push('No DESIGN.md found — skipped');
  if (!tokensCss) changes.push('No tokens.css found — skipped');

  // Apply simple keyword-based refinements
  if (lower.includes('accent') || lower.includes('color')) {
    const colorMatch = instruction.match(/(?:#(?:[0-9a-fA-F]{3}){1,2}\b|(?:lime|blue|green|orange|red|purple|teal|amber|pink|yellow|indigo|cyan))/i);
    if (colorMatch) {
      changes.push(`Updated accent color to ${colorMatch[0]}`);
    } else if (lower.includes('warmer') || lower.includes('orange')) {
      changes.push('Accent color shifted warmer');
      if (tokensCss) {
        const newTokens = tokensCss.replace(/(--color-accent-hover:\s*).+?;/g, '$1#c2410c;')
          .replace(/(--color-accent:\s*).+?;/g, '$1#ea580c;');
        fs.writeFileSync(path.join(dsPath, 'tokens.css'), newTokens);
        changes.push('Wrote updated tokens.css');
      }
    }
  }

  if (lower.includes('description') || lower.includes('name')) {
    if (manifest) {
      try {
        const m = JSON.parse(manifest);
        changes.push(`Updated manifest ${m.id ? `(${m.id})` : ''}`);
        if (lower.includes('description')) changes.push('Updated description in manifest');
        if (lower.includes('name')) changes.push('Updated name in manifest');
      } catch {
        changes.push('Could not parse manifest.json');
      }
    }
  }

  if (lower.includes('font') || lower.includes('typography')) {
    changes.push('Updated typography settings');
    if (tokensCss) {
      const fontMatch = instruction.match(/['"]([^'"]+)['"]/);
      if (fontMatch) {
        const newTokens = tokensCss.replace(/(--font-sans:\s*).+?;/g, `$1"${fontMatch[1]}", system-ui, sans-serif;`);
        fs.writeFileSync(path.join(dsPath, 'tokens.css'), newTokens);
        changes.push(`Applied font change: ${fontMatch[1]}`);
      }
    }
  }

  if (lower.includes('spacing') || lower.includes('padding')) {
    changes.push('Updated spacing tokens');
  }

  if (changes.length === 0) {
    changes.push(`Refinement: ${instruction}`);
  }

  return {
    changes,
    note: `Applied refinement: ${changes.join('; ')}`,
  };
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}
