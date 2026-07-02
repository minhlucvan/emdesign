---
name: test-page
description: Page and screen testing skill. Tests that composed pages have correct layout structure (header, main, footer, nav), all required sections are present, responsive metadata exists, and token binding is consistent. Use when verifying a composed view or screen. Writes a .test.ts file and runs vitest.
---

# Test Page

Page testing verifies the structural integrity of composed pages and screens. It checks landmark roles, section presence, responsive support, navigation, and token binding across the entire page.

## Primitives

| Function | What it checks |
|---|---|
| `checkPage(html, render)` | Composite: structure + sections + responsive + tokens |
| `assertPageHasSections(html, sections)` | Required landmark roles, IDs, or text |
| `assertHasPageStructure(html)` | Header, main, footer landmarks |
| `assertHasNavigation(html)` | Nav element, links, or menu role |
| `assertHasResponsiveMeta(html)` | Viewport meta or @media queries |
| `assertPageTokenBinding(render)` | No raw hex colors outside allowed set |

## Section Definition

```typescript
// Define expected sections as an array:
const sections = [
  { role: 'banner', required: true },
  { role: 'navigation', required: true },
  { role: 'main', required: true },
  { role: 'contentinfo', required: true },
  { text: 'Dashboard', required: true },
  { selector: '[data-testid="stats-section"]', required: false },
];
assertPageHasSections(renderedHtml, sections);
```

## Templates

- **Page structure**: `skills/test-engineering/test-scenarios/craft-page.ts`
- **Sections only**: `skills/test-engineering/test-scenarios/craft-sections.ts`
- **Responsive**: `skills/test-engineering/test-scenarios/responsive.ts`

## Running

```bash
npx vitest run src/__tests__/<Name>-page.test.ts --reporter=json
```

## Common Failures

| Assertion | Common failure | Fix |
|---|---|---|
| `assertHasPageStructure` | Missing `<header>`, `<main>`, or `<footer>` | Add landmark elements to the page layout |
| `assertPageHasSections` | Required section not found | Add the missing section component |
| `assertHasNavigation` | No nav/link/menu elements | Add navigation component |
| `assertHasResponsiveMeta` | No viewport meta or @media | Add `<meta viewport>` or responsive CSS |
