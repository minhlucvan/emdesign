// ds-compose-overview.js
// Section-based overview composition with Red-Green per primitive.
// 1. Analyze reference-example.html (or DESIGN.md) → discover sections + needed primitives
// 2. For each section: discover primitives → Red-Green each missing primitive → compose section story
// 3. Compose Showcase.stories.tsx from section stories
// 4. Verify all __tests__/* pass
//
// Usage: workflow('ds-compose-overview', { dsId, dsPath, maxAttempts? })

export const meta = {
  name: 'ds-compose-overview',
  description: 'Section-based Red-Green: analyze page, discover sections, create missing primitives with tests, compose Showcase.stories.tsx.',
  phases: [
    { title: 'Analyze', detail: 'Read reference HTML or DESIGN.md, discover sections and needed primitives' },
    { title: 'Build sections', detail: 'Per-section: Red-Green missing primitives, compose section story' },
    { title: 'Compose Showcase', detail: 'RED: visual regression test → GREEN: Showcase → verify loop' },
    { title: 'Verify all', detail: 'Run all __tests__/*, fix failures, retry' },
  ],
}

const _args = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dsId, dsPath, maxAttempts = 3 } = _args
if (!dsId || !dsPath) throw new Error('ds-compose-overview: dsId and dsPath are required')

const codeDir = dsPath + '/code'
const testsDir = dsPath + '/__tests__'
const previewPath = dsPath + '/reference-example.html'
const designMdPath = dsPath + '/DESIGN.md'

log(`[ds-compose] Composing overview for "${dsId}" at ${dsPath}`)

// ═══════════════════════════════════════════════════════════════════════
// Phase 1: Analyze — discover sections + needed primitives
// ═══════════════════════════════════════════════════════════════════════
phase('Analyze')
log('[ds-compose] Phase 1: Analyzing reference to discover sections')

const analyzeResult = await agent(
  `You are analyzing a design system's reference page and component library to discover sections.

Read the following files if they exist:
1. Reference preview HTML at ${previewPath} (if available)
2. DESIGN.md at ${designMdPath}
3. Tokens at ${dsPath}/tokens.css
4. List existing components: run "ls ${codeDir}/" to see what primitives already exist

Your task: Identify the visual sections of this design system's overview page.
Each section is a visual block (Hero, Color Palette, Typography, Spacing, etc.)
and each section needs specific React primitives to render.

For each section, determine:
- What React primitives it needs (e.g. ColorPalette needs: Swatch, Stack, Heading, Text)
- Which of those already exist in ${codeDir}/
- Which are missing and need to be created

Return a JSON object with a "sections" array:
{
  "sections": [
    {
      "name": "Hero",
      "type": "hero",
      "description": "Full-width header with gradient and DS name",
      "htmlContext": "brief description of what this section looks like",
      "neededPrimitives": ["Button", "Heading", "Text"],
      "existingPrimitives": ["Button"],
      "missingPrimitives": ["Heading", "Text"]
    }
  ]
}

If reference-example.html doesn't exist, use the DESIGN.md to infer sections.
At minimum include: Hero, ColorPalette, Typography, Spacing, ComponentDemos.

Keep neededPrimitives focused — only what's actually needed for rendering.`,
  { label: `analyze:${dsId}`, phase: 'Analyze', schema: {
    type: 'object',
    properties: {
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            htmlContext: { type: 'string' },
            neededPrimitives: { type: 'array', items: { type: 'string' } },
            existingPrimitives: { type: 'array', items: { type: 'string' } },
            missingPrimitives: { type: 'array', items: { type: 'string' } },
          },
          required: ['name', 'type', 'neededPrimitives', 'existingPrimitives', 'missingPrimitives'],
        },
      },
    },
    required: ['sections'],
  }}
)

const sections = analyzeResult?.sections ?? []
if (!sections || sections.length === 0) {
  throw new Error('[ds-compose] No sections detected from reference')
}

log(`[ds-compose] Found ${sections.length} sections:`)
for (const s of sections) {
  log(`  ${s.name}: ${s.missingPrimitives.length} missing, ${s.existingPrimitives.length} existing`)
}

// ═══════════════════════════════════════════════════════════════════════
// Phase 2: Build sections — per-section Red-Green for missing primitives
// ═══════════════════════════════════════════════════════════════════════
phase('Build sections')
log('[ds-compose] Phase 2: Building sections with Red-Green per primitive')

// Helper: Red-Green for one primitive
async function buildPrimitive(name, sectionType) {
  log(`[ds-compose]   Primitive "${name}": checking...`)

  // Check if already exists
  const exists = await agent(
    `Check if the file ${codeDir}/${name}.tsx exists.
Run: ls ${codeDir}/${name}.tsx 2>/dev/null || echo "NOT_FOUND"
If the file exists, read its first 10 lines and report its content summary.
Otherwise return "NOT_FOUND".`,
    { label: `check:${name}`, phase: 'Build sections', schema: {
      type: 'object', properties: {
        exists: { type: 'boolean' },
        summary: { type: 'string' },
      }, required: ['exists'],
    }}
  )

  if (exists?.exists) {
    log(`[ds-compose]   ✅ "${name}" exists — reusing`)
    return { name, status: 'reused' }
  }

  log(`[ds-compose]   🔴 "${name}" missing — creating with Red-Green`)

  // RED: write failing test first
  const redResult = await agent(
    `You are writing a RED (failing) test for a new React primitive "${name}" in the "${dsId}" design system.

The primitive will be used in the "${sectionType}" section of the overview page.
Read ${dsPath}/tokens.css to understand available CSS variables.
Read ${designMdPath} for design context.

Write a vitest test file at ${testsDir}/${name}.test.ts that tests:

1. **Component exists** — the .tsx file exists at ${codeDir}/${name}.tsx
2. **Lint passes** — import checkLint from @emdesign/testbed, expect result.mustFix === 0
3. **Token binding** — source code uses var(--token-*) references, no raw hex values (except #000, #fff, #ffffff)
4. **Behavior** (if interactive: buttons, inputs, links) — import checkBehavior from @emdesign/testbed, expect result.ok === true

Import template:
\`\`\`typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkLint, checkBehavior } from '@emdesign/testbed';

const source = fs.existsSync('${codeDir}/${name}.tsx')
  ? fs.readFileSync('${codeDir}/${name}.tsx', 'utf8')
  : '';

describe('${name} primitive', () => {
  it('file exists', () => {
    expect(fs.existsSync('${codeDir}/${name}.tsx')).toBe(true);
  });
  it('passes lint (zero P0 findings)', () => {
    const result = checkLint(source);
    expect(result.mustFix).toBe(0);
  });
  it('uses semantic tokens, not raw hex', () => {
    const rawHex = source.match(/#[0-9a-fA-F]{3,8}\\b/g) || [];
    const allowed = ['#000', '#000000', '#fff', '#ffffff', '#ffffff'];
    const violations = rawHex.filter(h => !allowed.includes(h.toLowerCase()));
    expect(violations.length).toBe(0);
  });
  // Add behavior test if interactive
});
\`\`\`

The test will FAIL because the component doesn't exist yet — that's the RED phase.
Write the test file using the Write tool.`,
    { label: `red:${name}`, phase: 'Build sections', schema: {
      type: 'object', properties: {
        testFile: { type: 'string' },
        testCount: { type: 'number' },
      }, required: ['testFile'],
    }}
  )
  log(`[ds-compose]   🔴 Test written: ${redResult?.testFile}`)

  // GREEN: create the component
  const greenResult = await agent(
    `You are creating the GREEN phase for primitive "${name}" in the "${dsId}" design system.

This primitive is needed for the "${sectionType}" section.
Read ${dsPath}/tokens.css for CSS variables and ${designMdPath} for design context.

Create ${codeDir}/${name}.tsx as a React functional component that:

1. Uses only var(--token-*) CSS variables — NO raw hex values
2. Accepts className?: string prop
3. Has a JSDoc comment explaining the component
4. Uses inline React.CSSProperties (not Tailwind classes, not external CSS)
5. Exports as named export matching the filename

Write the file using the Write tool.
Return the file path and a brief description.`,
    { label: `green:${name}`, phase: 'Build sections', schema: {
      type: 'object', properties: {
        filePath: { type: 'string' },
        description: { type: 'string' },
      }, required: ['filePath'],
    }}
  )
  log(`[ds-compose]   🟢 Created: ${greenResult?.filePath}`)

  // Verify: run the test
  log(`[ds-compose]   🔄 Verifying "${name}"...`)
  const verifyResult = await agent(
    `Run the test for "${name}" and report results.

Steps:
1. Run: npx vitest run ${testsDir}/${name}.test.ts --reporter=json 2>/dev/null || true
2. Check if tests passed or failed
3. If FAILED, read the output, fix the component at ${codeDir}/${name}.tsx, and re-run
4. Repeat until all pass or max 3 attempts

Return: { passed: true/false, details: "summary" }`,
    { label: `verify:${name}`, phase: 'Build sections', schema: {
      type: 'object', properties: {
        passed: { type: 'boolean' },
        details: { type: 'string' },
      }, required: ['passed'],
    }}
  )

  if (verifyResult?.passed) {
    log(`[ds-compose]   ✅ "${name}" tests pass`)
  } else {
    log(`[ds-compose]   ⚠️  "${name}" tests: ${verifyResult?.details ?? 'failed'}`)
  }

  return { name, status: verifyResult?.passed ? 'created' : 'failed' }
}

// Build all sections in parallel
const sectionResults = await parallel(sections.map((section) => () =>
  (async () => {
    log(`[ds-compose] Section "${section.name}": ${section.missingPrimitives.length} primitives to create`)

    // Build each missing primitive sequentially within the section
    const primitiveResults = []
    for (const prim of section.missingPrimitives) {
      const result = await buildPrimitive(prim, section.type)
      primitiveResults.push(result)
    }

    // Compose the section story
    log(`[ds-compose]   Composing section story for "${section.name}"`)
    const sectionStory = await agent(
      `You are creating a Storybook story for the "${section.name}" section of the "${dsId}" design system overview.

Existing primitives in ${codeDir}/: ${[...section.existingPrimitives, ...section.missingPrimitives].join(', ')}

Read ${dsPath}/tokens.css for CSS variable references.
Read ${designMdPath} for design context.

Create a React story file at ${codeDir}/${section.name}.stories.tsx that:

1. Imports the needed primitives from ./ (e.g. import { Button, Heading, Text } from './index')
2. Renders a section that visually matches what "${section.name}" should look like
3. Uses var(--token-*) for ALL styling — no raw hex values
4. Is self-contained (one story, one component)
5. Exports with title: 'Design System/${dsId}/${section.name}'

The section should use the existing primitives from code/ to compose the visual section.
Match the layout described in: ${section.htmlContext || section.description}

Write the file using the Write tool.
Return the story file path.`,
      { label: `story:${section.name}`, phase: 'Build sections', schema: {
        type: 'object', properties: {
          storyFile: { type: 'string' },
        }, required: ['storyFile'],
      }}
    )

    log(`[ds-compose]   ✅ Section story: ${sectionStory?.storyFile}`)
    return { name: section.name, primitives: primitiveResults, storyFile: sectionStory?.storyFile }
  })()
))

const successfulSections = sectionResults.filter(s => s?.storyFile)
log(`[ds-compose] ${successfulSections.length}/${sections.length} sections completed`)

// ═══════════════════════════════════════════════════════════════════════
// Phase 3: RED — Write tests (visual regression + unit)
// Phase 4: GREEN — Compose Showcase.stories.tsx to pass tests
// Phase 5: Verify — Run tests, iterate up to maxAttempts
// ═══════════════════════════════════════════════════════════════════════
phase('Compose Showcase')
log('[ds-compose] Phase 3: RED — writing visual regression test first')

const showcaseResult = await agent(
  `You are writing the RED phase test for the "${dsId}" overview page, then creating the Showcase to pass it.

### RED: Write visual regression test first

Read the reference preview HTML at ${dsPath}/reference-example.html (the VISUAL TARGET).
Read the section stories in ${codeDir}/ to understand available sections.

Write a test file at ${testsDir}/showcase-visual.test.ts that:

1. Reads reference-example.html as the baseline
2. Reads Showcase.stories.tsx as the actual output
3. Uses @emdesign/testbed's checkVisualDiff to compare them
4. Asserts similarity >= 0.90 (90%)
5. If reference-example.html doesn't exist, the test should still fail — the Showcase should be visually correct

Test template:
\`\`\`typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkVisualDiff } from '@emdesign/testbed';

describe('${dsId} overview visual regression', () => {
  it('Showcase visually matches reference-example.html', async () => {
    const baseline = fs.readFileSync('${dsPath}/reference-example.html', 'utf8');
    const showcase = fs.readFileSync('${codeDir}/Showcase.stories.tsx', 'utf8');
    // For a pure source-level comparison, we pass the source
    // The visual-diff engine compares HTML structure and inline styles
    const result = await checkVisualDiff(baseline, showcase, { threshold: 0.90 });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      console.log('Similarity:', result.similarity);
      console.log('Changed regions:', result.changedRegions);
    }
  });
});
\`\`\`

Write the test file using the Write tool.
Return: { testFile: string }`,
  { label: `red-visual:${dsId}`, phase: 'Compose Showcase', schema: {
    type: 'object', properties: {
      testFile: { type: 'string' },
    }, required: ['testFile'],
  }}
)

log(`[ds-compose] RED test written: ${showcaseResult?.testFile}`)

// GREEN: Compose Showcase to pass the visual regression test
log('[ds-compose] Phase 4: GREEN — composing Showcase to match reference')

const greenResult = await agent(
  `You are creating the Showcase.stories.tsx for "${dsId}" design system — the GREEN phase.

The following section stories were created:
${successfulSections.map(s => `  - ${codeDir}/${s.name}.stories.tsx`).join('\n')}

Read each section story file to understand what it renders.
Read ${dsPath}/tokens.css for token references.
Read ${dsPath}/reference-example.html if it exists for layout reference.

Create ${codeDir}/Showcase.stories.tsx that:

1. Imports each section as a React component from its .stories.tsx file
2. Arranges sections in order matching the reference-example.html layout
3. Wraps everything in a full-page layout using var(--color-surface) background
4. Uses var(--token-*) for ALL styling — no raw hex values
5. Exports as: title: 'Design System/${dsId}'
6. Matches the reference visual layout as closely as possible

IMPORTANT: Write the file using the Write tool. Return the file path.`,

  // ═══════════════════════════════════════════════════════════════════════
  // Verify: run visual regression test, iterate up to maxAttempts
  // ═══════════════════════════════════════════════════════════════════════
  { label: `green-showcase:${dsId}`, phase: 'Compose Showcase', schema: {
    type: 'object', properties: {
      filePath: { type: 'string' },
    }, required: ['filePath'],
  }}
)

// Verify: run visual regression test, iterate up to maxAttempts
let visualPassed = false
for (let attempt = 0; attempt < maxAttempts && !visualPassed; attempt++) {
  const verifyResult = await agent(
    `Run the visual regression test and report results.

Test file: ${showcaseResult?.testFile || testsDir + '/showcase-visual.test.ts'}
Showcase: ${greenResult?.filePath || codeDir + '/Showcase.stories.tsx'}

Steps:
1. Run: npx vitest run ${showcaseResult?.testFile || testsDir + '/showcase-visual.test.ts'} --reporter=json 2>/dev/null || true
2. Read the output — did the visual regression test pass?
3. If FAILED:
   - Check the similarity score and differences
   - Fix Showcase.stories.tsx to better match reference-example.html
   - Update colors, layout, sections to match
   - Re-run
4. Repeat until passed or ${maxAttempts} attempts

Return: { passed: true/false, similarity: number, failures: string[] }`,
    { label: `verify-visual:${dsId}`, phase: 'Compose Showcase', schema: {
      type: 'object', properties: {
        passed: { type: 'boolean' },
        similarity: { type: 'number' },
        failures: { type: 'array', items: { type: 'string' } },
      }, required: ['passed'],
    }}
  )

  visualPassed = verifyResult?.passed ?? false
  if (visualPassed) {
    log(`[ds-compose] ✅ Visual regression passed (${(verifyResult?.similarity ?? 0) * 100}% match)`)
  } else {
    log(`[ds-compose] ⚠️  Attempt ${attempt + 1}: ${(verifyResult?.similarity ?? 0) * 100}% — fixing...`)
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Phase 5: Verify all tests
// ═══════════════════════════════════════════════════════════════════════
phase('Verify all')
log('[ds-compose] Phase 5: Running all tests')

let allPassed = false
let verifyAttempts = 0

while (!allPassed && verifyAttempts < maxAttempts) {
  verifyAttempts++
  log(`[ds-compose] Test run ${verifyAttempts}/${maxAttempts}`)

  const verifyResult = await agent(
    `Run all design system tests and report results.

Steps:
1. Run: npx vitest run ${testsDir}/ --reporter=json 2>/dev/null || true
2. Read the output
3. Report: did all pass? how many? which failed?

If tests FAILED:
- Read the failure output
- Fix the issue (component or test)
- Re-run until all pass

Return: { passed: true/false, total: number, passedCount: number, failed: string[] }`,
    { label: `verify-all:${dsId}`, phase: 'Verify all', schema: {
      type: 'object', properties: {
        passed: { type: 'boolean' },
        total: { type: 'number' },
        passedCount: { type: 'number' },
        failed: { type: 'array', items: { type: 'string' } },
      }, required: ['passed'],
    }}
  )

  allPassed = verifyResult?.passed ?? false
  if (allPassed) {
    log(`[ds-compose] ✅ All ${verifyResult?.passedCount ?? '?'} tests passed`)
  } else {
    log(`[ds-compose] ⚠️  ${verifyResult?.failed?.length ?? '?'} tests failed`)
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════
log(`[ds-compose] ✅ Complete: "${dsId}"`)
log(`[ds-compose]   Sections: ${successfulSections.length}/${sections.length}`)
log(`[ds-compose]   Showcase: ${greenResult?.filePath ?? 'N/A'}`)
log(`[ds-compose]   Visual regression: ${visualPassed ? '✅ passes' : '⚠️  below threshold'}`)
log(`[ds-compose]   Tests: ${allPassed ? '✅ all passing' : '⚠️  some failing'}`)

return {
  overviewFile: greenResult?.filePath,
  sections: successfulSections.map(s => s.name),
  visualPassed,
  testsPassed: allPassed,
}
