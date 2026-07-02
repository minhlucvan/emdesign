# Figma Build Skill

## Token Roles

| Semantic Token Role | Tailwind Utility | CSS Var | Usage |
|---|---|---|---|
| `ink` | `text-black` | `--color-ink` | All body, headline, and caption type on light surfaces. Pure black — never mid-gray. Hierarchy comes from weight, not opacity. |
| `ink-inverse` | `text-white` | `--color-inverse-ink` | Type on inverse-canvas surfaces (footer, marquee, navy color block). |
| `surface` | `bg-white` | `--color-canvas` | Default page background, white cards, secondary pill button fill. |
| `surface-inverse` | `bg-black` | `--color-inverse-canvas` | Footer background, marquee strip, dark section ground. |
| `surface-muted` | `bg-[#f7f7f5]` | `--color-surface-soft` | Off-white tile for icon buttons, template cards, feature illustration tiles. |
| `primary` | `bg-black text-white` | `--color-primary` / `--color-on-primary` | Primary CTA fill ("Get started for free"), selected pricing tab. |
| `border` | `border-[#e6e6e6]` | `--color-hairline` | 1px borders on form inputs, pricing cards, table dividers. |
| `border-soft` | `border-[#f1f1f1]` | `--color-hairline-soft` | Subtler dividers — comparison-table row separators, footer column rules. |
| `block-lime` | `bg-[#dceeb1]` | `--color-block-lime` | Systems / FAQ / contact-form color-block section. |
| `block-lilac` | `bg-[#c5b0f4]` | `--color-block-lilac` | /design/ hero block, Release Notes promo banner. |
| `block-cream` | `bg-[#f4ecd6]` | `--color-block-cream` | FigJam hero strip, template-grid section. |
| `block-mint` | `bg-[#c8e6cd]` | `--color-block-mint` | FigJam pastel section. |
| `block-pink` | `bg-[#efd4d4]` | `--color-block-pink` | FigJam pastel section. |
| `block-coral` | `bg-[#f3c9b6]` | `--color-block-coral` | "Ship products" story block on home. |
| `block-navy` | `bg-[#1f1d3d] text-white` | `--color-block-navy` | Deep indigo story block — the only inverse color-block above the footer. |
| `accent-promo` | `bg-[#ff3d8b] text-white` | `--color-accent-magenta` | Single saturated CTA pink for promotional inline buttons. One per page max. |
| `success` | `text-[#1ea64a]` | `--color-semantic-success` | Comparison-table checkmark glyphs only — never used as a surface. |
| `scrim` | `bg-black/60` | `--color-overlay-scrim` | Behind modal / video-lightbox overlays (opacity applied at render time). |

## Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Font | Usage |
|---|---|---|---|---|---|---|
| **display-xl** | 86px | 340 | 1.00 | -1.72px | figmaSans | Hero headlines — home page, FigJam hero. Tightest tracking, tightest leading. Reads as a graphic, not text. |
| **display-lg** | 64px | 340 | 1.10 | -0.96px | figmaSans | Section-opener headlines. Slightly looser leading than display-xl for multi-line use. |
| **headline** | 26px | 540 | 1.35 | -0.26px | figmaSans | Story-block titles inside color blocks. Medium weight expresses authority at a smaller size. |
| **subhead** | 26px | 340 | 1.35 | -0.26px | figmaSans | Long-form intro paragraphs at near-headline scale. Same size as headline, lighter weight for body-like reading. |
| **card-title** | 24px | 700 | 1.45 | 0 | figmaSans | Pricing-tier names, feature card titles. Boldest weight in the system — used sparingly. |
| **body-lg** | 20px | 330 | 1.40 | -0.14px | figmaSans | Lead body copy on hero, contact form labels. |
| **body** | 18px | 320 | 1.45 | -0.26px | figmaSans | Default body. Lowest weight — the baseline the rest of the system flexes from. |
| **body-sm** | 16px | 330 | 1.45 | -0.14px | figmaSans | Card body text, footer link lists, comparison-table content. |
| **link** | 20px | 480 | 1.40 | -0.10px | figmaSans | Inline link emphasis. Same size as body-lg but 150 weight increments heavier — the eye reads emphasis without scale change. |
| **button** | 20px | 480 | 1.40 | -0.10px | figmaSans | All pill CTAs — primary, secondary, tertiary, magenta promo. Identical to link. |
| **eyebrow** | 18px | 400 | 1.30 | 0.54px | figmaMono | Uppercase section category labels. Mono face distinguishes taxonomy from display type. |
| **caption** | 12px | 400 | 1.00 | 0.60px | figmaMono | Uppercase captions, footer column headings. Smallest size — tightest leading. |

**Weights used across the system (figmaSans variable):** 320, 330, 340, 480, 540, 700. Do not use intermediate weights outside this set.

**Principle:** Display sizes (86px, 64px) use tight line-heights (1.00-1.10) and aggressive negative tracking (-1.72px, -0.96px). Body copy stays at near-zero letter-spacing with generous line-height (1.40-1.45). The contrast reinforces that headlines are graphics and body copy is for reading.

**Mono rule:** figmaMono is reserved for eyebrows and captions — always uppercase with positive letter-spacing (0.54px-0.60px). Never use figmaMono to set a paragraph.

**Font fallback stack:** `'figmaSans', 'figmaSans Fallback', 'SF Pro Display', system-ui, helvetica, sans-serif` / `'figmaMono', 'figmaMono Fallback', 'SF Mono', menlo, monospace`. If figmaSans/figmaMono are unavailable, use Inter (or Geist) for sans and JetBrains Mono (or Geist Mono) for mono.

## Spacing Scale

**Base unit:** 8px.

| Token | Value | Typical Usage |
|---|---|---|
| `hair` | 1px | Border widths, hairline dividers |
| `xxs` | 4px | Micro-gaps between tightly packed elements |
| `xs` | 8px | Button vertical padding (8px top/bottom), small gaps |
| `sm` | 12px | Form input vertical padding, small component gaps |
| `md` | 16px | Card interior padding (template cards), small section gaps |
| `lg` | 24px | Pricing card interior padding, grid gaps, button horizontal padding |
| `xl` | 32px | Section side gutters on desktop, layout margins |
| `xxl` | 48px | Color-block interior padding, hero vertical spacing |
| `section` | 96px | Vertical gap between major content sections |

**Key constants:**
- Color-block section interior padding: var(--spacing-xxl) = 48px
- Card interior padding: var(--spacing-lg) = 24px
- Form input padding: 12px vertical, 14px horizontal
- Section-to-section rhythm: var(--spacing-section) = 96px
- Button vertical/horizontal: 8px / 20-24px (asymmetric for optical centering)

**Whitespace philosophy:** White space makes the color blocks feel deliberate. Every colored panel is separated from the next by white canvas with 96px breathing room. Inside a color block, generous side margins (often >1/4 of block width each side) make the panel read as a poster, not a wall of copy.

## Radius & Depth

### Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `xs` | 2px | Anchor / link decoration corners, decorative micro-elements |
| `sm` | 6px | Small chips, sub-nav markers |
| `md` | 8px | Form inputs, image frames, template card containers |
| `lg` | 24px | Pricing cards, color-block sections, large image containers |
| `xl` | 32px | Hero feature panels, oversized callouts |
| `pill` | 50px | **All text CTAs** — every button is a pill |
| `full` | 9999px | Circular icon buttons (40px), comparison-checkmark glyphs (16px) |

**Critical rule:** Pill is the only button shape. Every CTA uses `rounded-pill` (50px). Icon buttons use `rounded-full` (9999px). Square buttons read as a different brand.

### Elevation Levels

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Color-block sections, inverse-canvas footer, hero |
| 1 (hairline) | 1px `--color-hairline` border on white | Pricing cards, form inputs, comparison table cells |
| 2 (soft) | `0 4px 16px rgba(0,0,0,0.06)` | Floating template tiles, dropdown menus |
| 3 (modal) | `0 12px 32px rgba(0,0,0,0.18)` + scrim behind | Video / image lightbox overlays |

**Principle:** Shadow-light by design. Color blocks substitute for traditional elevation — saturated background panels replace shadowed white cards. The rare shadow (e.g., a floating template card) feels like an exception worth noticing.

## Motion

| Token | Value | Usage |
|---|---|---|
| `--motion-fast` | 200ms | Hover transitions on nav links, icon button micro-interactions |
| `--motion-base` | 300ms | Standard transitions — card hover, template card scroll-reveal |
| `--motion-ease` | cubic-bezier(0.2, 0, 0, 1) | Default easing — subtle deceleration curve, no bounce or overshoot |

The Figma marketing system uses motion sparingly. Animations exist (template card lazy-load fade-in, marquee strip auto-scroll, color-block reveal) but are not the system's voice. Where motion is applied, prefer:
- Fade-in on scroll for template cards and color-block sections
- Smooth scroll for marquee strip logos
- No motion on CTAs (instant state change on hover/click)

Avoid bounce, elastic, or exaggerated animations — the system reads as editorial and technical, not playful.

## Component Patterns

### 1. Color-Block Section (signature pattern)

The defining surface of Figma's marketing. A full-content-width panel with `rounded-lg` (24px) corners and `xxl` (48px) interior padding. The section variant is chosen by background color.

```html
<section class="cb-lime" style="border-radius:24px;padding:48px;">
  <span class="color-block-eyebrow">EYEBROW LABEL</span>
  <h3 class="color-block-heading">Headline inside the block</h3>
  <p class="color-block-body">Supporting body copy. Single editorial column with generous side margins.</p>
  <button class="b-pill b-primary">CTA</button>
</section>
```

Variants: `cb-lime`, `cb-lilac`, `cb-cream`, `cb-mint`, `cb-pink`, `cb-coral` (all use `--color-ink` text), `cb-navy` (uses `--color-inverse-ink` white text).

**Critical rule:** Never place two color-block sections adjacent without white canvas between them. The page must return to `--color-canvas` between each block.

### 2. Pill Button Pair (brand signature)

The black-and-white CTA pair is the brand signature. Every section that needs both a primary and secondary action uses this combination.

```html
<div class="hero-actions" style="display:flex;gap:12px;">
  <button class="btn btn-primary">Get started for free</button>
  <button class="btn btn-secondary">Contact sales</button>
</div>
```

- `btn-primary`: `background: var(--primary); color: var(--on-primary); border-radius: 50px; padding: 10px 20px; font-weight: 480;`
- `btn-secondary`: `background: var(--canvas); color: var(--ink); border: 1px solid var(--hairline); border-radius: 50px; padding: 10px 22px;`

### 3. Pricing Tab Toggle

Pill-shaped tab group where selected state = black fill (identical to `button-primary` surface).

```html
<div style="display:flex;gap:8px;">
  <button class="b-pill b-tab-default" style="padding:8px 18px;">Starter</button>
  <button class="b-pill b-tab-selected" style="padding:8px 18px;">Professional</button>
  <button class="b-pill b-tab-default" style="padding:8px 18px;">Organization</button>
</div>
```

- Default: white background, black text, 1px `--color-hairline-soft` border
- Selected: black background, white text — reads as active CTA, not passive state

### 4. Pricing Card

Hairline-bordered white card with 24px rounded corners. No shadow — the border is the container.

```html
<div class="pricing-card" style="background:var(--canvas);border:1px solid var(--hairline);border-radius:24px;padding:24px;">
  <div class="pricing-card-tier" style="font-size:24px;font-weight:700;">Professional</div>
  <div class="pricing-card-price" style="font-size:32px;font-weight:600;letter-spacing:-0.5px;">$XX</div>
  <ul class="pricing-card-list" style="font-size:16px;line-height:1.6;">
    <li>Unlimited Figma files</li>
    <li>Team libraries</li>
  </ul>
  <button class="btn btn-primary">Buy</button>
</div>
```

### 5. Promo Banner with Magenta CTA

Lilac banner containing a single `button-magenta-promo`. Reserved for one promotional moment per page.

```html
<div class="promo-banner" style="background:var(--block-lilac);border-radius:8px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
  <span class="promo-banner-text"><strong>Release Notes</strong> · See how leading product teams are designing with Figma.</span>
  <button class="b-pill b-magenta" style="background:var(--accent-magenta);color:var(--on-primary);border-radius:50px;padding:10px 18px;">Save your spot</button>
</div>
```

## Anti-Patterns

Do NOT do any of the following:

- **Do not introduce mid-gray text.** Body hierarchy comes from figmaSans variable weight (320, 330, 340, 480, 540, 700), never from opacity or a mid-gray text color. All body type on light surfaces is pure black (`--color-ink: #000000`).

- **Do not add drop shadows to color-block sections.** The saturated pastel color IS the depth device. Adding box-shadow to a color block breaks the flat-panel aesthetic.

- **Do not square off CTAs.** Every CTA must be a pill (`border-radius: 50px`). Icon buttons must be circles (`border-radius: 9999px`). Square buttons read as a different brand.

- **Do not use more than one `--color-block-*` color in a single viewport.** The white canvas must separate each color block so each reads as a deliberate narrative device, not a wallpaper.

- **Do not put figmaMono in body copy.** Mono is a taxonomy tool — reserved for uppercase eyebrows and captions only. Never use it to set a paragraph.

- **Do not introduce new accent colors outside the documented block palette and `--color-accent-magenta`.** The system relies on the contrast between monochrome chrome and pastel blocks. Adding e.g. a saturated brand orange breaks the system.

- **Do not replace `pricing-tab-selected` black fill with a colored tab.** The brand pattern is selected = primary (black) surface, matching `button-primary`.

- **Do not use `--color-primary` (black) as a decorative accent.** Reserve it for genuine primary CTAs (`button-primary`) and active selected states (`pricing-tab-selected`).

- **Do not place two `button-primary` CTAs in the same viewport.** If a section needs two actions, neutralize one to `button-secondary`.

- **Do not use `--color-accent-magenta` more than once per page.** It is a single-shot promotional color.

## Reuse vs Author

This design system defines a library of components and patterns. Before authoring new markup, check if the pattern already exists as a named `@ds` component.

**Existing `@ds` components available for import:**

| Component | Description | Key Properties |
|---|---|---|
| `@ds/button-primary` | Black pill CTA | `bg-black text-white rounded-[50px] px-5 py-[10px] font-[480]` |
| `@ds/button-secondary` | White pill CTA | `bg-white text-black rounded-[50px] px-[22px] py-[10px] border border-[#e6e6e6]` |
| `@ds/button-magenta-promo` | Magenta accent pill CTA | `bg-[#ff3d8b] text-white rounded-[50px] px-[18px] py-[10px] font-[480]` |
| `@ds/button-tertiary-text` | Text-only button | `bg-transparent text-black px-3 py-2 rounded-full font-[480]` |
| `@ds/button-icon-circular` | 40px circle icon button | `w-10 h-10 rounded-full bg-[#f7f7f5] text-black` |
| `@ds/button-icon-circular-inverse` | 40px circle on dark bg | `w-10 h-10 rounded-full bg-white/16 text-white` |
| `@ds/color-block-section` | Full-width pastel section panel | `rounded-[24px] p-12` (choose lime/lilac/cream/mint/pink/coral/navy) |
| `@ds/pricing-card` | Hairline-bordered white card | `bg-white rounded-[24px] border border-[#e6e6e6] p-6` |
| `@ds/pricing-tab` | Pill toggle tab | Pill shape — default = white/black, selected = black/white |
| `@ds/text-input` | Form input | `bg-white rounded-[8px] border border-[#e6e6e6] px-[14px] py-3 text-[18px] font-[320]` |
| `@ds/promo-banner-lilac` | Lilac inline promo banner | `bg-[#c5b0f4] rounded-[8px] px-6 py-4 flex` |
| `@ds/template-card` | Off-white template tile | `bg-[#f7f7f5] rounded-[8px] p-4` |
| `@ds/marquee-strip` | Thin black scrolling ribbon | `bg-black text-white h-9 flex items-center text-[13px] tracking-wider uppercase font-mono` |
| `@ds/comparison-checkmark` | Green success check glyph | `w-4 h-4 rounded-full border border-[#1ea64a] text-[#1ea64a]` |
| `@ds/top-nav` | Sticky white nav bar | `bg-white sticky top-0 h-14 border-b border-[#e6e6e6]` |
| `@ds/footer` | Dense white link grid | `bg-white text-ink font-mono text-xs tracking-wider uppercase pt-24 pb-16` |

**Rule:** If `@ds/<Name>` exists, import it — do not re-author. If the existing component does not cover your exact variant (e.g., you need a new color-block section variant), add a new variant token (e.g., `--color-block-tangerine`) rather than rebuilding the component structure from scratch. Reference component tokens by their `{components.*}` name from DESIGN.md.
