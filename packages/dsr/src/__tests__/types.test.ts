import { describe, it, expect } from 'vitest';
import {
  SEMANTIC_TOKEN_ROLES,
  isSemanticToken,
  severityRank,
  parseDeclaredTokens,
  DesignSystem,
} from '@emdesign/dsr';
import type {
  TokenRole,
  Severity,
  Provenance,
  Diagnostic,
  RuleScope,
  Reference,
  Conflict,
  SectionView,
} from '@emdesign/dsr';
import type { GNode, GEdge, NodeLabel, EdgeLabel } from '@emdesign/graph';
import { Graph } from '@emdesign/graph';

// ---------------------------------------------------------------------------
// R1 / R2 coverage: required role families
// ---------------------------------------------------------------------------
describe('SEMANTIC_TOKEN_ROLES', () => {
  it('includes color-surface', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-surface');
  });

  it('includes color-surface-raised', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-surface-raised');
  });

  it('includes color-text', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-text');
  });

  it('includes color-text-muted', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-text-muted');
  });

  it('includes color-accent', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-accent');
  });

  it('includes color-accent-hover', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-accent-hover');
  });

  it('includes color-border', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('color-border');
  });

  it('includes radius', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('radius');
  });

  it('includes space-unit', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('space-unit');
  });

  it('includes font-sans', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('font-sans');
  });

  it('includes shadow-raised', () => {
    expect(SEMANTIC_TOKEN_ROLES).toContain('shadow-raised');
  });
});

// ---------------------------------------------------------------------------
// isSemanticToken
// ---------------------------------------------------------------------------
describe('isSemanticToken', () => {
  it('returns true for known tokens with and without leading --', () => {
    expect(isSemanticToken('color-surface')).toBe(true);
    expect(isSemanticToken('--color-surface')).toBe(true);
    expect(isSemanticToken('color-accent')).toBe(true);
    expect(isSemanticToken('font-sans')).toBe(true);
  });

  it('returns false for unknown tokens', () => {
    expect(isSemanticToken('color-neon')).toBe(false);
    expect(isSemanticToken('spacing-xl')).toBe(false);
    expect(isSemanticToken('--color-magic')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// severityRank
// ---------------------------------------------------------------------------
describe('severityRank', () => {
  it('orders P0 first, P1 second, P2 third', () => {
    expect(severityRank('P0')).toBeLessThan(severityRank('P1'));
    expect(severityRank('P1')).toBeLessThan(severityRank('P2'));
  });

  it('returns integer values', () => {
    expect(Number.isInteger(severityRank('P0'))).toBe(true);
    expect(Number.isInteger(severityRank('P1'))).toBe(true);
    expect(Number.isInteger(severityRank('P2'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Value-object type shapes
// ---------------------------------------------------------------------------
describe('Provenance type', () => {
  it('requires file and has optional line', () => {
    const prov: Provenance = { file: 'src/Button.tsx', line: 42 };
    expect(prov.file).toBe('src/Button.tsx');
    expect(prov.line).toBe(42);
  });

  it('line is optional (omitted)', () => {
    const prov: Provenance = { file: 'tokens.css' };
    expect(prov.file).toBe('tokens.css');
    expect(prov.line).toBeUndefined();
  });
});

describe('Diagnostic type', () => {
  it('has all required fields for a lint finding', () => {
    const d: Diagnostic = {
      ruleId: 'no-hex-color',
      severity: 'P0',
      message: 'Raw hex color #3B82F6 detected in className',
      scope: 'component',
      target: 'Button',
      where: { file: 'src/generated/Button.tsx', line: 12 },
      fix: 'Replace with bg-accent or text-accent token',
      snippet: 'className="bg-[#3B82F6]"',
    };
    expect(d.severity).toBe('P0');
    expect(d.scope).toBe('component');
    expect(d.target).toBe('Button');
    expect(d.where?.line).toBe(12);
    expect(d.fix).toBeDefined();
  });

  it('supports scope values: token, component, system, artifact', () => {
    const scopes: RuleScope[] = ['token', 'component', 'system', 'artifact'];
    for (const s of scopes) {
      const d: Diagnostic = { ruleId: 'test', severity: 'P1', message: 'test', scope: s };
      expect(d.scope).toBe(s);
    }
  });
});

describe('Conflict type', () => {
  it('supports duplicate-role kind', () => {
    const c: Conflict = {
      kind: 'duplicate-role',
      severity: 'P0',
      message: '--color-accent declared twice in tokens.css',
      subjects: ['color-accent'],
    };
    expect(c.kind).toBe('duplicate-role');
  });

  it('supports missing-role kind', () => {
    const c: Conflict = {
      kind: 'missing-role',
      severity: 'P0',
      message: 'Required role --color-surface is missing',
      subjects: ['color-surface'],
    };
    expect(c.kind).toBe('missing-role');
  });
});

// ---------------------------------------------------------------------------
// parseDeclaredTokens
// ---------------------------------------------------------------------------
describe('parseDeclaredTokens', () => {
  it('extracts token names from CSS variable declarations', () => {
    const css = `:root {
      --color-surface: #ffffff;
      --color-accent: #3b82f6;
      --radius: 8px;
    }`;
    const tokens = parseDeclaredTokens(css);
    expect(tokens).toContain('color-surface');
    expect(tokens).toContain('color-accent');
    expect(tokens).toContain('radius');
  });

  it('returns empty array for empty CSS', () => {
    expect(parseDeclaredTokens('')).toEqual([]);
  });

  it('returns empty array for CSS with no variable declarations', () => {
    expect(parseDeclaredTokens('/* just a comment */')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// DesignSystem aggregate
// ---------------------------------------------------------------------------
describe('DesignSystem class', () => {
  it('constructs with id, graph, and assets', () => {
    const g = new Graph('test');
    const ds = new DesignSystem('test', g, {
      designMd: '# My Design System\nA test design system.',
      tokensCss: ':root { --color-surface: #fff; --color-accent: #2563eb; }',
      manifest: {},
    });
    expect(ds.id).toBe('test');
    expect(ds.name).toBe('My Design System');
    expect(ds.declaredTokens).toContain('color-surface');
    expect(ds.declaredTokens).toContain('color-accent');
  });

  it('reads name from manifest when no markdown title', () => {
    const g = new Graph('test2');
    const ds = new DesignSystem('test2', g, {
      designMd: 'No H1 title here',
      tokensCss: '',
      manifest: { name: 'fallback-name' },
    });
    expect(ds.name).toBe('fallback-name');
  });
});

describe('SectionView type', () => {
  it('describes a section with title, metrics, and provenance', () => {
    const section: SectionView = {
      title: 'Color',
      index: 1,
      tableRows: 8,
      wordCount: 120,
      bulletCount: 3,
      namesStates: true,
      where: { file: 'DESIGN.md', line: 12 },
    };
    expect(section.title).toBe('Color');
    expect(section.tableRows).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// Graph node / edge types (from @emdesign/graph)
// ---------------------------------------------------------------------------
describe('Graph GNode type', () => {
  it('has id, label, and props with optional source provenance', () => {
    const node: GNode = {
      id: 'atelier/--color-accent',
      label: 'token',
      props: {
        name: '--color-accent',
        value: '#2563eb',
        source: { file: 'tokens.css', line: 3 },
      },
    };
    expect(node.id).toBe('atelier/--color-accent');
    expect(node.label).toBe('token');
    expect(node.props.source?.file).toBe('tokens.css');
  });
});

describe('Graph GEdge type', () => {
  it('has from, to, label, and props', () => {
    const edge: GEdge = {
      id: 'e1',
      label: 'tokenValue',
      from: 'atelier/--color-accent',
      to: 'atelier/color-blue-600',
      props: {},
    };
    expect(edge.from).toBe('atelier/--color-accent');
    expect(edge.to).toBe('atelier/color-blue-600');
    expect(edge.label).toBe('tokenValue');
  });
});

describe('NodeLabel builtin types', () => {
  it('includes all design-system entity kinds', () => {
    const labels: NodeLabel[] = [
      'designSystem', 'file', 'section', 'token', 'color', 'typeface',
      'theme', 'primitive', 'prop', 'variant', 'state', 'story',
      'artifact', 'rule',
    ];
    for (const l of labels) {
      // Just verify it's a valid string — type-level check at compile time
      expect(typeof l).toBe('string');
    }
  });
});

describe('EdgeLabel builtin types', () => {
  it('includes declaredIn, contains, definedIn, uses', () => {
    const edges: EdgeLabel[] = ['declaredIn', 'contains', 'definedIn', 'uses'];
    for (const e of edges) {
      expect(typeof e).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// FrameworkAdapter interface shape (R22 / delta-spec)
// Imported from @emdesign/backend — may fail if cross-package import fails
// (which is acceptable for the RED step)
// ---------------------------------------------------------------------------
describe('FrameworkAdapter interface', () => {
  it('requires codegenInstructions, lint, storyTemplate, parsesCode', async () => {
    let FrameworkAdapterType: any;
    try {
      const mod = await import('@emdesign/backend');
      FrameworkAdapterType = mod.FrameworkAdapter;
    } catch {
      // If the import fails because the module isn't available from dsr,
      // that's acceptable — the test exposes the missing dependency.
      expect(true).toBe(false); // force failure
      return;
    }
    // If we got here, verify the interface shape via a minimal implementation
    const adapter: typeof FrameworkAdapterType = {
      id: 'react-tailwind',
      fileExt: '.tsx',
      primitiveImport: '@ds/primitives',
      codegenInstructions: () => '# React rules\n- Use bg-surface classes',
      lint: () => [],
      storyTemplate: (name: string) => `export const Default = () => <${name} />;`,
      parsesCode: true,
    };
    expect(adapter.codegenInstructions).toBeDefined();
    expect(typeof adapter.codegenInstructions).toBe('function');
    expect(typeof adapter.lint).toBe('function');
    expect(typeof adapter.storyTemplate).toBe('function');
    expect(adapter.parsesCode).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RepoPaths shape (imported from @emdesign/backend — cross-package)
// ---------------------------------------------------------------------------
describe('RepoPaths interface', () => {
  it('has all required directory fields', async () => {
    let RepoPathsType: any;
    try {
      const mod = await import('@emdesign/backend');
      RepoPathsType = mod.RepoPaths;
    } catch {
      expect(true).toBe(false);
      return;
    }
    // The RepoPaths type is structural; verify it at runtime via resolveRepoPaths
    const { resolveRepoPaths } = await import('@emdesign/backend');
    const paths = resolveRepoPaths('/tmp/test-project');
    expect(paths.root).toBeDefined();
    expect(paths.designSystemsDir).toBeDefined();
    expect(paths.generatedDir).toBeDefined();
    expect(paths.componentsDir).toBeDefined();
    expect(paths.screenshotsDir).toBeDefined();
    expect(paths.stateFile).toContain('.emdesign/state.json');
  });
});
