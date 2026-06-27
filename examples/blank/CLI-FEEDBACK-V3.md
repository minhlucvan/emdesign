# CLI Feedback V3 — Design System Registry & Production Building Blocks

> Date: 2026-06-27
> References: `awesome-design-md` (74 brands), `emdesign _vendor/open-design/` (13 bases), `CLI-FEEDBACK-V2.md`
> Problem: The CLI can only import design systems from the local filesystem. Users have no way to discover, import from remote sources, or easily customize a design system to match a brand.

---

## 0. Vision: The Design System Registry

The CLI should be to design systems what `npm` is to packages — a registry client that discovers, installs, and composes production-ready design systems.

```
emdesign ds search "modern dashboard"      # Find matching systems
emdesign ds install @registry/dashboard-ui  # Install from registry
emdesign ds init --from stripe              # Quick-start with Stripe's design
emdesign ds customize --brand "MyApp"       # Re-skin to match your brand
emdesign ds publish                         # Share your system with the world
```

The registry ecosystem has three tiers:

| Tier | Source | Count | Content | Completeness |
|------|--------|-------|---------|-------------|
| **Vendor** | `_vendor/open-design/` | 13 | DESIGN.md + tokens.css + code/ + manifest | ✅ Full |
| **Awesome** | `awesome-design-md` (GitHub) | 74 | DESIGN.md only (no tokens.css, no code/) | ⚠️ Partial |
| **Community** | npm / git / custom | ∞ | Varies | ⚠️ Varies |

---

## 1. Discovery: Finding the Right Design System

A user should be able to say "I want a design system like Linear" or "I need a modern fintech dashboard" and find matching options instantly.

### Commands

```
emdesign ds search <query>                         # Search by keyword, category, vibe
emdesign ds search "fintech dashboard" --limit 10  # Filtered search
emdesign ds search --category Fintech              # Browse by category

emdesign ds list --remote                          # List all available remote systems
emdesign ds list --installed                       # List locally installed systems (current behavior)
emdesign ds list --all                             # Both remote and local

emdesign ds info <id>                              # Show system details (tokens, fonts, primitives)
emdesign ds info open-design/brutalist             # "What does the Brutalist system look like?"
emdesign ds info awesome-apple                     # "What does Apple's design system include?"
```

### Search Sources

| Source | What Gets Searched | Example |
|--------|-------------------|---------|
| `_vendor/open-design/` | 13 full systems | `emdesign ds search editorial` → finds after-hours, editorial-burgundy |
| `awesome-design-md` (GitHub) | 74 brand DESIGN.md files | `emdesign ds search fintech` → finds Stripe, Coinbase, Kraken |
| npm registry | `@emdesign/ds-*` packages | `emdesign ds search dashboard --source npm` |
| Community registries | Custom registry URLs | `emdesign ds search --registry https://ds.mysite.com/api` |

### Architecture

```typescript
interface RegistrySource {
  name: string;
  type: 'vendor' | 'github' | 'npm' | 'custom';
  url?: string;
  systems: RegistrySystem[];
}

interface RegistrySystem {
  id: string;
  name: string;
  category: string;
  description: string;
  source: string;           // e.g. "open-design/brutalist" or "awesome-apple"
  completeness: 'full' | 'design-md-only' | 'minimal';
  tokens: number;           // count
  primitives: string[];     // available primitives
  previewUrl?: string;      // screenshot or preview
}
```

**What exists today:** `ds list` (local only), `ds bases` (vendor only), `listBases()` in scaffold.ts reads catalog.json.

**What's missing:** Remote search, registry abstraction, GitHub API integration for awesome-design-md.

---

## 2. Import: Multiple Sources

Currently `ds create --mode import --from <base>` only works with local filesystem paths. We need multi-source import.

```
emdesign ds import vendor <id>                            # From _vendor/open-design/
emdesign ds import git <url> [--ref <branch>] [--path <dir>]  # From git repo
emdesign ds import awesome <brand>                        # From awesome-design-md
emdesign ds import npm <package>                          # From npm
emdesign ds import url <url>                              # From any URL
emdesign ds import figma <key>                            # From Figma (future)
```

### How Each Source Would Work

**Vendor import** (exists today, minor improvements):
```
emdesign ds import vendor brutalist --name "My Brand"
# → Copies from _vendor/open-design/brutalist, re-ids manifest, strips source provenance
# → Same as current `ds create --mode import --from open-design/brutalist`
```

**Git import** (new):
```
emdesign ds import git https://github.com/voltagent/awesome-design-md --path claude
# → git clone --depth 1 <url> /tmp/emdesign-import-xxx
# → Finds DESIGN.md at <path>/DESIGN.md
# → Generates tokens.css from the YAML frontmatter (colors, typography)
# → Scaffolds default primitives
# → Creates manifest.json
# → Returns new system id
```

**Awesome-design-md import** (new, convenience wrapper):
```
emdesign ds import awesome linear
# → Fetches https://raw.githubusercontent.com/voltagent/awesome-design-md/main/linear.app/
# → Downloads DESIGN.md, preview.html, preview-dark.html
# → Generates tokens.css from YAML frontmatter
# → Scaffolds primitives from atelier or a matching base
# → Creates manifest.json with source attribution
# → Returns new system: "linear" with 24 tokens, 7 primitives
```

**NPM import** (new):
```
emdesign ds import npm @acme/design-system
# → npm pack @acme/design-system --pack-destination /tmp/emdesign-import-xxx
# → Extracts and places under design-systems/<id>/
# → Validates the package has the required files
```

### What Import Produces

Regardless of source, every import produces a complete emdesign design system:

```
design-systems/<id>/
  DESIGN.md        — from source (or generated)
  tokens.css       — from source (or generated from frontmatter)
  manifest.json    — generated, with source provenance tracked
  code/            — primitives (scaffolded from matching base or atelier)
    index.ts
    Button.tsx
    Card.tsx
    Heading.tsx
    Input.tsx
    Badge.tsx
    Stack.tsx
```

**What exists today:** Only vendor import (filesystem copy).

**What's missing:** Git clone, GitHub raw fetch, npm pack, URL fetch, DESIGN.md→tokens.css compiler for awesome-design-md files.

---

## 3. Customization: "Make It Look Like Brand X"

Once imported, the user needs to customize the design system to match their brand. This goes beyond the current `--color` and `--font` flags.

### Quick Customization

```
# Basic (current)
emdesign ds customize brutalist --name "My Brand" --color "#ff6600" --font Inter

# Brand-aware (new)
emdesign ds customize --brand "MyApp" --primary "#6366f1" --secondary "#0f172a"
emdesign ds customize --brand "MyApp" --from-image ./brand-guidelines.png
emdesign ds customize --brand "MyApp" --from-url https://myapp.com
```

### Vision-Assisted Extraction (New)

```
emdesign ds extract --from-image ./screenshot.png --name "My Brand"
# → Vision model reads the screenshot
# → Extracts: primary color, fonts, spacing, surface colors
# → Creates tokens.css with detected values
# → Proposes DESIGN.md sections based on visual analysis
# → Scaffolds primitives
# → Returns: "Detected palette: #6366f1 primary, Inter font, 8px spacing unit"
```

```
emdesign ds extract --from-url https://stripe.com --name "Stripe-like"
# → Screenshots the page
# → Analyzes the rendered CSS (extracts computed styles)
# → Builds a design system that matches the brand
```

### Interactive Tuning (New)

```
emdesign ds tune <id>                               # Interactive what-if tuning
emdesign ds tune <id> --primary "#ff0000"           # See the impact of changing primary
emdesign ds tune <id> --font "Inter" --spacing 4    # Live preview of changes
```

The tune command would:
1. Apply the change to a temporary copy of tokens.css
2. Rebuild the graph
3. Show a diff: "Changing primary from #3b82f6 to #ff0000 affects 12 components"
4. Commit only on confirmation

### What-If Analysis (New)

```
emdesign ds what-if <id> --change '{"--color-primary": "#ff0000"}'
# → "This change affects: 17 components, 3 screens.
#    3 components use --color-primary-hover which inherits.
#    1 component (Sidebar) has direct color references."
```

**What exists today:** `ds customize` (clone + token regex replace for 4 fields), `ds diff` (structural comparison).

**What's missing:** Vision extraction, URL analysis, interactive tuning, what-if impact analysis.

---

## 4. Building Blocks: Production-Ready Primitives

Every production design system needs a consistent set of primitives. The current system scaffolds 6 primitives from atelier. A production-ready system needs more.

### The Production Primitive Set

| Primitive | Variants | States | Key Props |
|-----------|----------|--------|-----------|
| `Button` | primary, secondary, ghost, danger | hover, active, focus, disabled, loading | variant, size, icon, fullWidth |
| `Card` | default, interactive, elevated | hover, selected | padding, variant, as |
| `Input` | text, search, number, password | focus, error, disabled, placeholder | label, helperText, error, prefix, suffix |
| `Select` | default, multiple | focus, error, disabled, open | options, placeholder, searchable |
| `Badge` | neutral, accent, success, warn, danger, dot | — | variant, size, dot |
| `Heading` | h1-h6 + section title + page title | — | level, as, truncate |
| `Text` | body, body-sm, label, tiny, code, mono | — | variant, color, truncate |
| `Stack` | row, col | — | gap, align, justify, wrap |
| `Grid` | auto-fill, fixed, columns | — | cols, gap, minChildWidth |
| `Table` | default, dense, striped | — | columns, rows, sortable, selectable |
| `Tabs` | underline, pills, segments | active, hover, disabled | tabs, activeTab, onChange |
| `Modal` | default, fullscreen, side-panel | open, closing | title, size, closeOnOverlay |
| `Toast` | success, warn, danger, info | enter, exit | message, variant, duration, action |
| `Tooltip` | top, bottom, left, right | visible, hidden | content, position, delay |
| `Avatar` | image, initials, icon | — | src, name, size, status |
| `Spinner` | default, page, inline | — | size, variant |
| `Skeleton` | text, card, avatar, table | — | variant, count, width |
| `Divider` | horizontal, vertical | — | label, variant |
| `Dropdown` | click, hover | open, closing, selected | items, trigger, placement |
| `Pagination` | default, compact, simple | active, disabled | total, page, onChange, siblingCount |
| `Breadcrumb` | default, collapsed | — | items, separator, maxItems |
| `Progress` | determinate, indeterminate | — | value, variant, size, label |
| `Switch` | default | checked, disabled | checked, onChange, label |
| `Checkbox` | default | checked, indeterminate, disabled | checked, onChange, label |
| `Radio` | default, group | checked, disabled | checked, onChange, label |
| `Textarea` | default | focus, error, disabled | label, rows, maxLength, resize |
| `FormField` | wrapper | — | label, error, helper, required, layout |

### Commands

```
# List available building blocks
emdesign ds block list
emdesign ds block list --tags form,data,navigation

# Scaffold specific blocks into a design system
emdesign ds scaffold <id> --blocks Button,Card,Input,Table,Tabs,Modal,Toast

# Add a custom block
emdesign ds block add DataTable --from ./DataTable.tsx --to <id>

# View a block's spec
emdesign ds block show Button --fields variants,states,props
```

### Block Registry

Building blocks are stored in a central registry:

```
design-systems/_blocks/
  Button/
    Button.tsx          — implementation
    Button.stories.tsx  — stories covering all variants
    Button.spec.json    — metadata (variants, states, props, tokens used)
    Button.test.tsx     — tests (if applicable)
  Card/
    ...
```

When a design system is scaffolded, blocks are copied and their token references automatically rebind to the new system.

**What exists today:** 7 primitives (Badge, Button, Card, Heading, Eyebrow, Input, Stack). Scaffold copies from atelier.

**What's missing:** 24 more blocks, block registry, block metadata, per-block stories + tests.

---

## 5. Rules & Linting

Each design system comes with tuned lint rules. Different categories of design system need different rules.

### Built-In Rule Presets

| Preset | Best For | Rules Included |
|--------|----------|---------------|
| `editorial` | Content-heavy, serif-led | off-token-color, accent-overuse, filler-copy, sans-display |
| `product` | UI apps, dashboards | off-token-color, accent-overuse, emoji-icon, invented-metric, external-image |
| `fintech` | Financial, data-dense | + strict-contrast, no-decorative-accent, mono-data-values |
| `minimal` | Clean, restrained | —accent-overuse, —external-image, + strict-spacing |
| `brutalist` | Bold, experimental | —accent-overuse (exempted), + no-focus-ring |
| `a11y-strict` | Accessibility-first | All rules at P0, +contrast-min-7-1, +focus-visible-required |

### Commands

```
# Show active lint rules
emdesign ds lint-rules <id>
emdesign ds lint-rules <id> --json

# Change rule severity
emdesign ds lint-rules set <id> accent-overuse P0        # Make it blocking
emdesign ds lint-rules set <id> accent-overuse off        # Disable it

# Apply a preset
emdesign ds lint-rules preset <id> fintech                # Switch to fintech preset

# Add custom rules
emdesign ds lint-rules add <id> --name "no-raw-margin" --severity P0 --pattern "margin: \d+px"

# Validate design system against its own rules
emdesign ds lint <id>                                     # Self-check
```

### Rule Categories

| Category | Example Rules | Source |
|----------|--------------|--------|
| **Token** | off-token-color, unresolved-token, token-self-check | `dsr/src/rules/lint.ts` |
| **Brand** | accent-overuse, sans-display, ai-default-indigo | `graph/src/rules.ts` |
| **Content** | filler-copy, invented-metric, emoji-icon | `graph/src/rules.ts` |
| **Spatial** | no-overlap, minimum-gap, alignment, aspect-ratio | `dsr/src/charters/geometry/` |
| **A11y** | contrast-min, focus-visible, heading-order, image-alt | `plugin-core/src/rules/a11y/` |
| **Motion** | motion-reduced, no-autoplay, duration-consistency | Proposed |
| **Typography** | type-scale-consistency, line-height-ratio, tracking-rules | Proposed |

**What exists today:** 12 core rules + 7 geometry charters + 3 a11y rules. `manifest.json` has `craft.applies` and `craft.exemptions`.

**What's missing:** Rule presets per category, CLI surface for rule management, rule authoring.

---

## 6. Higher-Order Components & Blueprints

Primitives are the atoms. Blueprints are the molecules — documented patterns for composing primitives into higher-order components.

### What Are Blueprints?

A blueprint is a reusable composition pattern:

```
blueprints/
  stat-card/           # Card + Heading + Text + optional Badge
  data-filters/        # Input + Select + Button in a Stack
  form-section/        # FormField + Input/Select/Textarea in a Stack
  page-header/         # Heading + Breadcrumb + Button group
  sidebar-nav/         # Stack + links + active state + user section
  data-table-toolbar/  # FilterBar + Button + Pagination
  modal-form/          # Modal + FormField fields + Button group
```

### Blueprint Format

```json
{
  "id": "stat-card",
  "name": "Stat Card",
  "description": "Metric display: label, value, optional trend",
  "composes": ["Card", "Stack", "Heading", "Text", "Badge"],
  "props": { "label": "string", "value": "string", "trend": "up|down|neutral?" },
  "slots": ["default", "actions"],
  "template": "StatCard.tsx.blueprint",
  "stories": ["default", "with-trend", "loading", "with-actions"],
  "lint-rules": ["accent-overuse", "off-token-color"]
}
```

### Commands

```
# List available blueprints
emdesign ds blueprint list
emdesign ds blueprint list --category data,form

# Apply a blueprint to create a component
emdesign ds blueprint apply stat-card --name "RevenueMetric" --to src/generated
emdesign ds blueprint apply data-filters --name "OrderFilters" --to src/generated

# Register a custom blueprint
emdesign ds blueprint register ./custom-blueprint.json

# Show blueprint details
emdesign ds blueprint show stat-card
```

### Production Blueprint Catalog

| Blueprint | Primitives Used | Use Case |
|-----------|----------------|----------|
| `stat-card` | Card, Heading, Text, Badge | Dashboard metrics |
| `data-table` | Table, Pagination, Badge | Tabular data |
| `data-filters` | Input, Select, Button | Filter bars |
| `form-section` | FormField, Input, Select, Textarea | Form groups |
| `page-header` | Heading, Breadcrumb, Button | Page chrome |
| `sidebar-nav` | Stack, Text, Badge | Navigation |
| `modal-form` | Modal, FormField, Button | Dialog forms |
| `toast-container` | Stack, Toast | Notification area |
| `tabs-with-content` | Tabs, Stack, Card | Tabbed interfaces |
| `card-grid` | Grid, Card, Heading | Card layouts |
| `search-results` | Input, Table, Pagination | Search UI |
| `settings-page` | Tabs, FormField, Switch | Settings UI |
| `activity-feed` | Stack, Card, Text, Badge | Activity streams |
| `chart-card` | Card, Heading, Tabs | Chart containers |

**What exists today:** `compose` command creates basic composed views.

**What's missing:** Blueprint format, blueprint registry, template engine, slot system.

---

## 7. Registry Protocol

A standard for packaging and distributing design systems.

### Package Format

A design system package (local or remote) must have:

```
design-systems/<id>/
  DESIGN.md               — Required: 9-section visual contract
  tokens.css              — Required: CSS custom properties
  manifest.json           — Required: metadata + craft rules
  code/                   — Required: primitive components
    index.ts
    Button.tsx
    Card.tsx
    ...
```

Optional:

```
  lint-rules.json          — Rule presets and overrides
  blueprints/              — Composition blueprints
    stat-card/
      stat-card.json
      StatCard.tsx.blueprint
  preview.png              — Design system preview
  preview.html             — Interactive preview (like awesome-design-md)
  CHANGELOG.md             — Version history
  dist/                    — Compiled output (if published)
    tokens.ts
    types.ts
    tokens.css
```

### Manifest Schema (Extended)

```json
{
  "schemaVersion": "od-design-system-project/v2",
  "id": "my-system",
  "name": "My System",
  "version": "1.0.0",
  "category": "Product",
  "description": "...",
  "surface": "web",
  "registry": {
    "source": "git",
    "url": "https://github.com/org/design-systems",
    "ref": "main",
    "updated": "2026-06-27"
  },
  "files": {
    "design": "DESIGN.md",
    "tokens": "tokens.css",
    "components": "code/"
  },
  "craft": {
    "applies": ["off-token-color", "accent-overuse", "..."],
    "exemptions": [],
    "preset": "product"
  },
  "stats": {
    "tokens": 31,
    "primitives": 7,
    "blueprints": 14,
    "lintRules": 15
  }
}
```

### Remote Registry API

```
GET /api/v1/search?q=fintech+dashboard
GET /api/v1/packages/<id>
GET /api/v1/packages/<id>/download
```

For `awesome-design-md`, the registry is the GitHub repo. For npm, it's the npm registry. For custom registries, any API that returns the correct format.

---

## 8. The Complete User Journey

Putting it all together — what a user session looks like:

```bash
# 1. I want to build a fintech dashboard
emdesign ds search fintech
# → Found: Stripe, Coinbase, Kraken, Digits Fintech Swiss

# 2. I like Stripe's design — import it
emdesign ds import awesome stripe --name "MyFintech"
# → DESIGN.md from awesome-design-md
# → tokens.css generated from YAML frontmatter
# → Primitives scaffolded from product preset
# → Manifest created

# 3. Customize it to my brand
emdesign ds customize MyFintech --primary "#7c3aed" --font "Inter"
# → Updated tokens.css
# → Diff: "12 tokens changed, 1 rule relaxed (accent-overuse → P1)"

# 4. Apply fintech lint rules
emdesign ds lint-rules preset MyFintech fintech
# → strict-contrast: P0, mono-data-values: P0, no-decorative-accent: P0

# 5. Validate everything
emdesign ds validate MyFintech --strict
# → ✅ Token contract: 31 roles, all present
# → ✅ Lint rules: 15 active, 0 conflicts

# 6. Activate and start building
emdesign use MyFintech
emdesign ds blueprint apply stat-card --name "RevenueCard"
emdesign ds blueprint apply data-table --name "TransactionsTable"
emdesign ds scaffold MyFintech --blocks Modal,Toast,Tabs,Pagination

# 7. Build screens
emdesign layout create Dashboard --type sidebar
emdesign screen create Dashboard --route /dashboard --layout Dashboard
emdesign render analyze Dashboard
# → "3 components use orphan token --color-border-strong"

# 8. Iterate with the loop
emdesign loop Dashboard --gate
# → Lint: pass | Spatial: pass | A11y: 1 advisory | Gate: SHIP
```

---

## 9. CLI Command Summary

### Design System Registry

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds search <query>` | Search remote registries | 🔴 P0 |
| `ds list --remote` | List remote systems | 🔴 P0 |
| `ds list --installed` | List local systems (exists) | ✅ Existing |
| `ds info <id>` | Show system details | 🟡 P1 |
| `ds registry add <url>` | Add custom registry source | 🟡 P1 |
| `ds registry list` | List active registries | 🟢 P3 |

### Import

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds import vendor <id>` | From vendor dir | ✅ Existing |
| `ds import git <url> [--path]` | From git repo | 🔴 P0 |
| `ds import awesome <brand>` | From awesome-design-md | 🔴 P0 |
| `ds import npm <package>` | From npm | 🟡 P1 |
| `ds import url <url>` | From any URL | 🟡 P1 |

### Customization

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds customize <id> --color --font` | Quick re-skin | ✅ Existing |
| `ds customize --brand <name>` | Brand-aware customization | 🔴 P0 |
| `ds extract --from-image <file>` | Vision-assisted extraction | 🟡 P1 |
| `ds extract --from-url <url>` | URL extraction | 🟡 P2 |
| `ds tune <id> --primary #hex` | What-if tuning | 🟡 P1 |
| `ds what-if <id> --change <json>` | Impact analysis | 🟡 P1 |

### Building Blocks

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds block list` | List building blocks | 🟡 P1 |
| `ds block show <id>` | Block details | 🟡 P1 |
| `ds block add <name> --from <file>` | Register custom block | 🟡 P1 |
| `ds scaffold <id> --blocks <list>` | Scaffold specific blocks | 🔴 P0 |

### Rules & Linting

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds lint-rules list <id>` | Show active rules | ✅ Partial |
| `ds lint-rules set <id> <rule> <severity>` | Change severity | 🔴 P0 |
| `ds lint-rules preset <id> <preset>` | Apply rule preset | 🔴 P0 |
| `ds lint-rules add <id> --rule <def>` | Add custom rule | 🟡 P1 |
| `ds lint <id>` | Self-check DS against rules | 🟡 P1 |

### Blueprints / Composition

| Command | Purpose | Priority |
|---------|---------|----------|
| `ds blueprint list` | List blueprints | 🟡 P1 |
| `ds blueprint apply <name> <target>` | Create component from blueprint | 🔴 P0 |
| `ds blueprint register <file>` | Add custom blueprint | 🟡 P1 |
| `ds blueprint show <name>` | Blueprint details | 🟢 P3 |

---

## 10. Implementation Roadmap

### Phase 1: Awesome Import (Now)
1. `ds import awesome <brand>` — fetch DESIGN.md from GitHub, generate tokens.css from YAML frontmatter, scaffold primitives
2. `ds search` — search awesome-design-md catalog by keyword/category
3. `ds lint-rules preset` — fintech, product, editorial presets

### Phase 2: Extended Import (Next)
1. `ds import git <url>` — git clone + extract design system
2. `ds import npm <package>` — npm install + extract
3. `ds customize --brand` — batch token customization from brand params
4. `ds block scaffold` — expand block library to 25+ primitives

### Phase 3: Advanced (Future)
1. `ds extract --from-image` — vision-assisted DS extraction
2. `ds blueprint` — full blueprint registry + composition engine
3. `ds tune` — interactive what-if tuning
4. Registry publication — `ds publish`, community registries

---

## Appendix: Existing Infrastructure

| Capability | Where It Lives Today | Use for V3 |
|-----------|---------------------|------------|
| **Vendor base import** | `scaffold.ts` `createDesignSystem(mode:'import')` | Reuse for all import modes |
| **Token validation** | `scaffold.ts` `validateDesignSystem()` | Reuse for post-import validation |
| **Primitive scaffolding** | `scaffold.ts` `scaffoldPrimitives()` | Reuse for block scaffolding |
| **DS customization** | `scaffold.ts` `customizeDesignSystem()` | Reuse + extend for brand customization |
| **Catalog index** | `_vendor/open-design/catalog.json` | Model for remote registry format |
| **normalizeDsRef** | `paths.ts` | Extend to handle git/npm/URL refs |
| **DS diff** | `scaffold.ts` `diffDesignSystems()` | Reuse for what-if comparison |
| **Graph impact analysis** | `graph/src/query.ts` `findAffected()` | Reuse for what-if impact |
| **Lint rule registry** | `dsr/src/rules/registry.ts` | Reuse, extend with presets |
| **Craft exemptions** | `manifest.json` `craft.exemptions` | Reuse for lint-rule management |
| **Awesome-design-md** | GitHub (74 brands) | Primary import source |
| **Vendor bases** | `_vendor/open-design/` (13 systems) | Secondary import source |
