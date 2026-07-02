# Claude Build Skill

Claude is the warm-canvas editorial design system for Anthropic's claude.ai marketing and product surfaces. It anchors on a tinted cream page floor (`#faf9f5`), coral primary CTAs (`#cc785c`), slab-serif display headlines (Copernicus/Tiempos Headline at weight 400 with negative tracking), humanist sans body (StyreneB/Inter), and dark navy product mockup surfaces (`#181715`). The brand voltage comes from the cream/coral pairing — deliberately warm, literary, and editorial, opposite the cool blue/gray AI competitors. All visual values are declared in `tokens.css`; this skill documents how to use them. Every leaf author, craft-primitives agent, build-element agent, and build-section agent reads this as ground truth.

## Token Roles

The system defines 11 semantic token roles. Every component must reference these roles — never raw values.

| Role | Tailwind Class | CSS Variable | When to Use |
|---|---|---|---|
| Surface (page floor) | `bg-surface` | `var(--color-surface)` | Default page/canvas background for sections, bands, hero bands, nav bar — the warm cream page floor |
| Surface raised (card) | `bg-surface-raised` | `var(--color-surface-raised)` | Feature cards, content cards, and any container one step above the page floor |
| Text (ink) | `text-text` | `var(--color-text)` | All headlines, body copy, and labels on light surfaces — the primary warm-dark text color |
| Text muted | `text-text-muted` | `var(--color-text-muted)` | Breadcrumbs, captions, footer-adjacent secondary text, placeholders, breadcrumbs |
| Accent (coral) | `bg-accent` / `text-accent` | `var(--color-accent)` | Primary CTA backgrounds, brand emphasis — scarce on individual elements, generous on full-bleed callout cards |
| Accent hover | `hover:bg-accent-hover` | `var(--color-accent-hover)` | Pressed/darker state for any element using the accent background |
| Border (hairline) | `border-border` | `var(--color-border)` | 1px borders on inputs, model-comparison cards, connector tiles, and dividers on cream surfaces |
| Radius (default) | `rounded` | `var(--radius)` | Default 8px corner rounding for buttons, text inputs, category tabs, and interactive controls |
| Space unit (base) | _(via Tailwind spacing)_ | `var(--space-unit)` | 4px base unit — all padding, margin, and gap values derive from it (`p-1` = 4px, `p-4` = 16px, etc.) |
| Font sans | `font-sans` | `var(--font-sans)` | Body text, navigation, buttons, captions, labels, inputs — NEVER for display headlines |
| Shadow raised | `shadow-raised` | `var(--shadow-raised)` | Subtle elevated state on interactive elements that need lift (rare — the system prefers color-block depth over shadows) |

## Type Scale

All display sizes use the serif display family (`--font-display`: Copernicus / Tiempos Headline / Cormorant Garamond) at weight 400 with negative letter-spacing. Never bold serif display text. Body sizes use the sans family (`--font-sans`: StyreneB / Inter). Never use a sans font for display headlines.

| Token | CSS Variable | Size / Weight / Line | Tracking | Family | Use Case |
|---|---|---|---|---|---|
| display-xl | `var(--text-display-xl)` | 64px / 400 / 1.05 | -1.5px | serif | Homepage hero h1 — the singular page-greeting headline |
| display-lg | `var(--text-display-lg)` | 48px / 400 / 1.1 | -1px | serif | Major section headings ("Why Claude?", "Pricing") |
| display-md | `var(--text-display-md)` | 36px / 400 / 1.15 | -0.5px | serif | Sub-section headings, model/feature names |
| display-sm | `var(--text-display-sm)` | 28px / 400 / 1.2 | -0.3px | serif | Pricing tier names, callout card headlines, pre-footer CTA heads |
| title-lg | `var(--text-title-lg)` | 22px / 500 / 1.3 | 0 | sans | Pricing plan size labels, prominent product labels |
| title-md | `var(--text-title-md)` | 18px / 500 / 1.4 | 0 | sans | Feature card titles, intro paragraph lead-ins |
| title-sm | `var(--text-title-sm)` | 16px / 500 / 1.4 | 0 | sans | Connector tile titles, list section labels |
| body-md | `var(--text-body-md)` | 16px / 400 / 1.55 | 0 | sans | Default running text — paragraphs, descriptions, article body |
| body-sm | `var(--text-body-sm)` | 14px / 400 / 1.55 | 0 | sans | Footer body, fine-print, cookie-consent text |
| caption | `var(--text-caption)` | 13px / 500 / 1.4 | 0 | sans | Badge labels, small metadata, image captions |
| caption-uppercase | `var(--text-caption-uppercase)` | 12px / 500 / 1.4 | 1.5px | sans | "NEW" / "BETA" badges, category tags — the only uppercase text |
| button | `var(--text-button)` | 14px / 500 / 1.0 | 0 | sans | All button labels |
| nav-link | `var(--text-nav-link)` | 14px / 500 / 1.4 | 0 | sans | Top navigation menu items |
| code | `var(--text-code)` | 14px / 400 / 1.6 | 0 | mono (`--font-mono`) | Code blocks, terminal output, inline code — JetBrains Mono |

## Spacing Scale

Base unit is 4px (`--space-unit`). Tailwind spacing classes map 1:1 (each step = unit * index): `p-1` = 4px, `p-2` = 8px, etc.

| Token | CSS Variable | Value | Tailwind Class | Use Case |
|---|---|---|---|---|
| xxs | `var(--space-xxs)` | 4px | `p-1` | Badge inner padding, icon-to-text gaps, tiny inline adjustments |
| xs | `var(--space-xs)` | 8px | `p-2` | Tab vertical padding, radio/checkbox-to-label, tight element clusters |
| sm | `var(--space-sm)` | 12px | `p-3` | Button horizontal padding (`px-3`), compact card padding, input-to-icon gaps |
| md | `var(--space-md)` | 16px | `p-4` | Standard element-to-element gap, form field stacking, nav-item spacing |
| lg | `var(--space-lg)` | 24px | `p-6` | Card padding (code windows, connectors), list-item groups, section sub-gaps |
| xl | `var(--space-xl)` | 32px | `p-8` | Generous card padding (feature cards, pricing tiers, model comparison) |
| xxl | `var(--space-xxl)` | 48px | `p-12` | Internal padding for callout/CTA bands, generous section sub-gaps |
| section | `var(--space-section)` | 96px | `py-24` | Vertical rhythm between major page bands — the standard section gap |

Card padding defaults: feature / pricing / model-comparison cards use `p-8` (32px). Code-window cards and connector tiles use `p-6` (24px). Callout/CTA bands use `p-12` (48px) internally. Section spacing between bands uses `py-24` (96px).

## Radius and Depth

### Radius Scale

| Token | CSS Variable | Value | Tailwind Class | Use Case |
|---|---|---|---|---|
| xs | `var(--radius-xs)` | 4px | `rounded-xs` | Badge accent corners, tiny dropdown containers |
| sm | `var(--radius-sm)` | 6px | `rounded-sm` | Small inline buttons, dropdown items |
| md (default) | `var(--radius)` | 8px | `rounded` | Primary/secondary buttons, text inputs, category tabs — the system default |
| lg | `var(--radius-lg)` | 12px | `rounded-lg` | Content cards (feature, pricing, code-window, model-comparison, connector) |
| xl | `var(--radius-xl)` | 16px | `rounded-xl` | Hero illustration container, large marquee components |
| pill | `var(--radius-pill)` | 9999px | `rounded-full` | Badge pills, "NEW" / "BETA" tags |
| full | `var(--radius-full)` | 9999px | `rounded-full` | Avatar substitutes, circular icon buttons — same value as pill |

### Depth / Elevation

The elevation philosophy is **color-block first, shadow rare**. Most depth comes from surface contrast (cream canvas vs. cream-card vs. dark navy) rather than shadows.

| Level | Technique | When to Use |
|---|---|---|
| Flat | No shadow, no border | Body sections, top nav, hero bands — sits directly on canvas |
| Hairline-bordered | 1px `border-border` | Input fields, sub-nav rows, model-comparison cards, connector tiles, pricing-tier cards |
| Raised cream card | `bg-surface-raised` with no border | Feature cards, pricing-tier cards (background color creates the elevation step) |
| Dark surface card | `bg-[var(--color-surface-dark)]` | Code editor mockups, model showcase cards, pricing featured tier, pre-footer bands, footer |
| Subtle shadow | `shadow-raised` (0 1px 3px rgba(20,20,19,0.08)) | Hover-elevated states on interactive elements only — extremely rare in the system |
| Focus ring | `shadow-[var(--shadow-focus-ring)]` (0 0 0 3px rgba(204,120,92,0.15)) | Active/focused input elements — coral outer ring at 15% alpha, 3px |

## Motion

Motion is restrained — the brand is editorial, not theatrical. Duration values and easing come from `tokens.css`.

| Token | CSS Variable | Value | Use Case |
|---|---|---|---|
| fast | `var(--motion-fast)` | 200ms | Hover lift, color transitions (button bg shift), fade-out dismissal |
| base | `var(--motion-base)` | 350ms | Slide-up card reveals on scroll, standard enter animations |
| slow | `var(--motion-slow)` | 500ms | Hero headline fade-in on page load, slow entrances |
| ease-standard | `var(--ease-standard)` | ease-out | Default easing for all brand motion — decelerated, never ease-in or bounce |

### When motion IS allowed

- **Interactive elements only:** button background shifts (`bg-accent` to `bg-accent-hover`), focus ring appearance, hover elevation (shadow reveal), input focus border color.
- **Scroll-triggered reveals:** cards fading + sliding 24px upward over 350ms, with 80ms staggered delay between siblings. Implement via IntersectionObserver with 150px root margin.
- **Anchor scroll:** smooth scroll at 400ms ease-out.
- **Hero code-window typewriter effect:** characters appear at 40-60ms intervals with opacity fade, reserved only for the homepage hero slot.

### When motion is STATIC (forbidden)

- Animate only 1-2 properties per element (usually `background-color` and `box-shadow` or `opacity` and `transform`). Never animate `width`, `height`, or `top`/`left` — use `transform` instead.
- No parallax, no horizontal scroll-triggered transforms, no orbital rotations, no bounce.
- Decorative elements (non-interactive cards, static text, logos) do not animate.
- All animations respect `prefers-reduced-motion: reduce` by presenting the final state immediately.

## Component Patterns

These examples show how primitives compose. Always import from `@ds/claude/` — never re-author. The `@ds` Vite alias resolves to `design-systems/claude/code/`.

### 1. Primary CTA Button

```tsx
import { Button } from '@ds/claude';

// Primary coral CTA — the signature action element
<Button variant="primary">Try Claude</Button>

// Secondary cream button — pairs with primary on the same row
<Button variant="secondary">Learn more</Button>
```

The `Button` primitive handles all states internally. Primary uses `bg-accent text-white hover:bg-accent-hover focus-visible:shadow-[var(--shadow-focus-ring)]`. Both variants use `rounded` (8px), `px-5 py-3` (20px / 12px), `font-sans` at button weight/line (14px / 500 / 1).

### 2. Feature Card with Heading and Body

```tsx
import { Card, Heading } from '@ds/claude';

<Card className="p-8 max-w-sm space-y-4">
  <Heading level={3}>Built for teams</Heading>
  <p className="font-sans text-[var(--text-body-md)] text-text leading-[1.55]">
    Claude scales from individual developers to the largest enterprises.
  </p>
</Card>
```

`Card` uses `bg-surface-raised rounded-lg p-8` (no border — the surface-color step provides the elevation). Internal padding `p-8` (32px). Body text uses `font-sans` with `text-body-md` sizing.

### 3. Product Mockup Card (Dark Surface)

```tsx
// Dark navy card for code editor mockups and model showcase
<div className="bg-[var(--color-surface-dark)] rounded-lg p-8 text-[var(--color-on-dark)]">
  <div className="flex items-center gap-2 mb-4">
    <span className="size-3 rounded-full bg-[var(--color-accent-teal)]" />
    <span className="font-sans text-xs text-[var(--color-on-dark-soft)] tracking-[0.5px] uppercase">
      Claude Code — connected
    </span>
  </div>
  <pre className="font-mono text-sm leading-[1.6] text-[var(--color-on-dark-soft)]">
    <code>{`$ claude deploy --env production
✓ Build complete (12.4s)
✓ Deploying to us-east-1`}</code>
  </pre>
</div>
```

Dark surfaces invert text: use `var(--color-on-dark)` (#faf9f5) for primary text and `var(--color-on-dark-soft)` (#a09d96) for secondary. Code blocks inside dark cards can use `bg-[var(--color-surface-dark-soft)]` (#1f1e1b) as inner background. Radius is `rounded-lg` (12px).

### 4. Category Tab Row

```tsx
// Active / inactive tab pill group
<div className="flex gap-2 font-sans">
  <button className="bg-surface-raised text-text rounded px-3.5 py-2 text-sm font-medium">
    All solutions
  </button>
  <button className="bg-transparent text-text-muted border border-border rounded px-3.5 py-2 text-sm font-medium">
    Enterprise
  </button>
  <button className="bg-transparent text-text-muted border border-border rounded px-3.5 py-2 text-sm font-medium">
    Research
  </button>
</div>
```

Active: `bg-surface-raised text-text`. Inactive: `bg-transparent text-text-muted border-border`. Both use `rounded` (8px) and `px-3.5 py-2` (14px / 8px matching DESIGN.md). Element gap uses `gap-2` (8px).

### 5. CTA Band with Inverted Button

```tsx
// Coral callout band — the highest-voltage moment on the page
<section className="bg-accent rounded-lg p-12 text-center space-y-6 max-w-4xl mx-auto">
  <h2 className="font-[var(--font-display)] text-[var(--text-display-sm)] text-white leading-[1.2] tracking-[-0.3px]">
    Start building with Claude
  </h2>
  <p className="font-sans text-[var(--text-body-md)] text-white/80 leading-[1.55]">
    Free tier available. No credit card required.
  </p>
  <Button variant="primary" className="!bg-surface !text-text !border-border">
    Get started free
  </Button>
</section>
```

Coral bands invert children: the CTA inside becomes a cream/canvas button (`!bg-surface !text-text`). Avoid coral-on-coral as it loses affordance. Text on coral uses `var(--color-on-primary)` (#ffffff). Section padding: `p-12` (48px). Display headline uses `--font-display` (serif), not `font-sans`.

## Anti-Patterns

These are strictly forbidden. The consistency lint rejects any of these patterns.

### DO NOT use raw hex values

```
X bg-[#cc785c]          -> use bg-accent
X text-[#141413]        -> use text-text
X border-[#e6dfd8]      -> use border-border
X text-[#6c6a64]        -> use text-text-muted
X bg-[#faf9f5]          -> use bg-surface
X bg-[#efe9de]          -> use bg-surface-raised
```

### DO NOT hardcode spacing

```
X p-[24px]    -> use p-6
X gap-[32px]  -> use gap-8
X py-[96px]   -> use py-24
X px-[20px]   -> use px-5
X m-[12px]    -> use m-3
```

### DO NOT use incorrect font families

```
X font-sans on a display headline     -> display MUST use --font-display (serif)
X font-serif on body text             -> body MUST use --font-sans (StyreneB/Inter)
X Inter for display (h1/h2/h3)        -> only Copernicus/Tiempos serif for display
X bold (700) weight on display        -> display serif stays at weight 400
X Helvetica or Arial for body          -> must be humanist sans (StyreneB/Inter/Sohne)
```

### DO NOT add hover states beyond what is encoded

```
X hover:scale-105                  -> cards do not scale on hover
X hover:shadow-lg                  -> the system has only one shadow token
X group-hover:bg-accent-hover      -> nested hover reveals are out of brand
X transition-all                   -> animate only specific properties
X hover:-translate-y-1             -> no lift motion on hover
```

### DO NOT introduce colors outside the palette

```
X purple, blue, cyan, green surfaces   -> trinity is cream + coral + dark navy only
X pure white (#ffffff) as bg            -> use bg-surface (#faf9f5) warm cream
X cool grays (#f5f5f5, #e0e0e0)        -> all neutrals are warm-tinted
X saturated cyan as accent              -> coral is the only brand accent
```

### DO NOT use wrong border radius

```
X rounded-2xl (16px) on buttons         -> buttons use --radius (8px)
X rounded (8px) on feature cards        -> cards use rounded-lg (12px)
X rounded-md on code-window cards       -> cards use rounded-lg (12px)
X rounded on badge pills                -> pills use rounded-full (9999px)
```

### DO NOT use shadows on flat elements

```
X shadow-raised on nav bars             -> nav is flat
X shadow-raised on hero bands           -> hero bands are flat
X shadow-raised on dark surface cards   -> dark cards use color-block depth
X shadow on feature cards               -> cream card elevation is pure color
```

### DO NOT animate non-interactive elements

```
X animate-bounce on badges              -> decorative motion is not part of the system
X transition on card backgrounds        -> only interactive elements animate
X keyframe animations on page load      -> the system is editorial and static
```

### DO NOT use uppercase outside caption-uppercase

```
X uppercase on body text           -> only caption-uppercase (12px/500/1.5px tracking)
X uppercase on nav links           -> nav links are title case
X uppercase on button labels       -> buttons are sentence case ("Try Claude")
```

## Reuse vs Author

If a primitive exists at `@ds/claude/`, import it. **Never re-author.**

Available primitives in `design-systems/claude/code/` (importable via `@ds/claude/`):

| Import Path | Exports | Description |
|---|---|---|
| `@ds/claude` | `Button`, `Card`, `Input`, `Badge`, `Heading`, `Stack` | Index barrel — all primitives in one import |
| `@ds/claude/Button` | `Button` | Primary/secondary/text-link/icon variants. Use `<Button variant="primary">` rather than hand-authoring button HTML. |
| `@ds/claude/Card` | `Card` | Raised cream card shell with `bg-surface-raised rounded-lg`. Add padding via className (`p-8` for feature cards, `p-6` for compact). |
| `@ds/claude/Heading` | `Heading` | Display serif headlines for h1-h3. Handles Copernicus font, weight 400, and negative tracking. |
| `@ds/claude/Input` | `Input` | Standard text input with focus-ring (coral 3px at 15% alpha) and hairline border. |
| `@ds/claude/Badge` | `Badge` | Pill labels for tags and categories. Supports cream and coral variants. |
| `@ds/claude/Stack` | `Stack` | Flex layout with consistent gap — use instead of manual `space-y-*` / `gap-*` for vertical and horizontal stacks. |

### Composition Rule

Assemble primitives rather than building from bare HTML/Tailwind. Primitives carry correct token bindings, focus styles, and responsive defaults. If a primitive does not exist for the exact shape you need, compose existing primitives inside a container — do not create a new standalone component unless the entire system agrees it is a new pattern.

### When to Author a New Primitive

Only if the pattern is used in 3+ places AND no combination of existing primitives produces it. File the new primitive under `design-systems/claude/code/<Name>.tsx` and export it from `code/index.ts`. Update this skill if a new primitive is added.
