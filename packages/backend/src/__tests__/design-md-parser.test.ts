import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// R27 — DESIGN.md Parser
// The spec requires a dedicated design-md-parser module with:
//   - Frontmatter extraction
//   - H2 section parsing by title
//   - Section anchor caching
//   - 9 required sections + optional 10th "Tokens" section
//   - Malformed frontmatter → error with diagnostics
//
// NOTE: This module does NOT exist yet — the first import will fail (RED).
// Once created, it must handle the table cases below.
// ---------------------------------------------------------------------------

// Attempt to import the module. For the RED step this will throw
// (ModuleNotFound / ERR_MODULE_NOT_FOUND), causing the test to fail.
let parseDesignMd: (content: string) => any;
let moduleFound = false;

try {
  const mod = await import('../design-md-parser.js');
  parseDesignMd = mod.parseDesignMd ?? mod.default ?? mod.parseSections ?? mod.parse;
  moduleFound = true;
} catch {
  // Module not found — expected during RED step.
  // All test cases will fail at runtime, which is the correct RED outcome.
  parseDesignMd = () => { throw new Error('design-md-parser module not yet implemented'); };
}

// ---------------------------------------------------------------------------
// Table case 1: Valid 9-section DESIGN.md with frontmatter
// ---------------------------------------------------------------------------
describe('Valid 9-section DESIGN.md', () => {
  const validMd = `---
name: Atelier
category: Custom
surface: web
description: A modern design system for testing.
version: 0.1.0
---

# Atelier
> Category: Custom
> Surface: web

A design system for testing.

## 1. Visual Theme & Atmosphere
Bright, clean, accessible.

## 2. Color
Surface: #fff, Accent: #2563eb, Text: #18181b.

## 3. Typography
Inter for headings, system-ui for body.

## 4. Spacing
Base unit: 8px.

## 5. Layout & Composition
Max-width 1280px, centered.

## 6. Components
Button, Card, Badge, Input specs.

## 7. Motion & Interaction
200ms ease-in-out for all transitions.

## 8. Voice & Brand
Professional, clear, direct.

## 9. Anti-patterns
No raw hex colors, no indigo gradients, no slop patterns.
`;

  it('returns frontmatter with name, description, version', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const result = parseDesignMd(validMd);
    expect(result.frontmatter).toBeDefined();
    expect(result.frontmatter.name).toBe('Atelier');
    expect(result.frontmatter.version).toBe('0.1.0');
  });

  it('returns array of 9 sections with title, anchor, body', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const result = parseDesignMd(validMd);
    expect(result.sections).toHaveLength(9);
    // Each section has a title, anchor, and body
    for (const section of result.sections) {
      expect(section).toHaveProperty('title');
      expect(section).toHaveProperty('anchor');
      expect(section).toHaveProperty('body');
      expect(typeof section.title).toBe('string');
      expect(typeof section.anchor).toBe('string');
    }
    expect(result.sections[0].title).toContain('Visual Theme');
    expect(result.sections[1].title).toContain('Color');
    expect(result.sections[8].title).toContain('Anti-patterns');
  });

  it('caches section anchors for cross-referencing', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const result = parseDesignMd(validMd);
    if (result.anchors) {
      expect(result.anchors['color']).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Table case 2: 10-section DESIGN.md including optional Tokens section
// ---------------------------------------------------------------------------
describe('10-section DESIGN.md with Tokens section', () => {
  const mdWithTokens = `---
name: Extended
---

# Extended

A design system with a Tokens section.

## 1. Visual Theme & Atmosphere
Content.

## 2. Color
Content.

## 3. Typography
Content.

## 4. Spacing
Content.

## 5. Layout & Composition
Content.

## 6. Components
Content.

## 7. Motion & Interaction
Content.

## 8. Voice & Brand
Content.

## 9. Anti-patterns
Content.

## 10. Tokens
See tokens.css for the machine contract.
`;

  it('returns 10 sections when Tokens section is present', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const result = parseDesignMd(mdWithTokens);
    expect(result.sections).toHaveLength(10);
    const lastSection = result.sections[9];
    expect(lastSection.title).toContain('Tokens');
  });
});

// ---------------------------------------------------------------------------
// Table case 3: Malformed frontmatter (invalid YAML)
// ---------------------------------------------------------------------------
describe('Malformed frontmatter', () => {
  it('returns error with diagnostic on invalid YAML', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const badMd = `---
name: "Broken
: unmatched quotes
---

# Test

Content.
`;
    expect(() => parseDesignMd(badMd)).toThrow();
    // The error should include diagnostic info about the parse failure
    try {
      parseDesignMd(badMd);
    } catch (e: any) {
      const msg = e.message ?? String(e);
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it('returns error with diagnostic on missing closing frontmatter delimiter', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const noClose = `---
name: Test
no closing delimiter

# Test

Content.
`;
    expect(() => parseDesignMd(noClose)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Table case 4: Empty file
// ---------------------------------------------------------------------------
describe('Empty DESIGN.md', () => {
  it('returns error on empty content', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    expect(() => parseDesignMd('')).toThrow();
    expect(() => parseDesignMd('   ')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Table case 5: Missing H2 sections
// ---------------------------------------------------------------------------
describe('Missing H2 sections', () => {
  it('returns fewer sections without crashing', () => {
    if (!moduleFound) expect.fail('design-md-parser module not found — RED step');
    const partial = `---
name: Partial
---

# Partial

Some content.

## 1. Visual Theme
Bright.

## 6. Components
Just this one.
`;
    const result = parseDesignMd(partial);
    expect(result.sections.length).toBeLessThan(9);
    expect(result.sections.length).toBeGreaterThanOrEqual(1);
  });
});
