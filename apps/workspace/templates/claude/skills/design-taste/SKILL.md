---
name: design-taste
description: Master skill for design taste — embeds deliberate, opinionated design decisions into every agent interaction. Use at the START of any task to replace generic AI output with intentional design. Adapted from taste-skill (Leonxlnx) for emdesign's design system pipeline.
tags: [design-system, design-taste, anti-slop, design-engineering, emdesign]
---

# design-taste

Design taste is what separates a system that feels intentional from one that looks templated. This skill embeds taste into every phase: DESIGN.md authoring, token generation, primitive scaffolding, component building, and review.

**The core idea:** Read the room first, set your dials, then design with intent. Never default.

---

## 1. Design Taste Philosophy

Taste isn't subjective opinion — it's **consistent, informed judgment** applied across every decision. In emdesign, taste means:

- **Intent over default** — every token value, component variant, and layout choice has a *reason* tied to the design system's character
- **Restraint over abundance** — knowing what *not* to do (one accent color, not five; one display typeface, not three; generous whitespace over crowded layouts)
- **Coherence over variety** — every element reads as belonging to the same system, not a grab bag of UI patterns
- **Opinion over safety** — a design system with a strong point of view produces better output than one that tries to please everyone

**The four sources of taste in emdesign:**
1. **Brief inference** (The Design Read) — extract intent from the user's words
2. **Three dials** (Variance × Motion × Density) — tune the system's character
3. **Anti-default discipline** — actively avoid AI-generated clichés
4. **Brand fingerprint** — what makes this system distinct from every other system

---

## 2. The Three Dials (Design System Edition)

The three dials from taste-skill, recontextualized for design system work:

### DESIGN_VARIANCE (1-10) — How opinionated are the token values?
Controls the boldness of every visual decision in the system.

| Range | Token Character | Color | Typography | Radius |
|-------|----------------|-------|------------|--------|
| 1-3 (Conventional) | Standard scale, safe values | 2-3 neutrals + 1 accent | System UI (Inter/SF) + 1 weight | 4-6px |
| 4-6 (Characterful) | One distinctive move | Warm/cool shift, 1-2 accents | UI sans + display serif/sans | 8-12px |
| 7-8 (Bold) | Strong opinion, unusual combos | High contrast, saturated accent | Custom display, expressive pairing | 16px+ or 0 |
| 9-10 (Avant-garde) | Extreme, provocative | Clashing/neon, duotone | Kinetic/experimental type | Variable/oversized |

### MOTION_INTENSITY (1-10) — How much motion does the system use?
Controls duration, easing, and what properties animate.

| Range | Motion Profile | Durations | Easing | Scope |
|-------|---------------|-----------|--------|-------|
| 1-3 (Static) | Instant transitions | 0-100ms | Linear | Only feedback (hover) |
| 4-6 (Purposeful) | Micro-interactions | 150-300ms | Ease-in-out | Feedback + state transitions |
| 7-8 (Expressive) | Delight-driven | 300-500ms | Custom spring | Layout, enter/exit, parallax |
| 9-10 (Kinetic) | Cinematic | 500ms+ | Physics/bounce | Page transitions, scroll-driven |

### VISUAL_DENSITY (1-10) — How much information per view?
Controls spacing scale, type size, and information density.

| Range | Density Profile | Spacing Unit | Body Type | Padding |
|-------|----------------|-------------|-----------|---------|
| 1-3 (Airy) | Generous whitespace, editorial | 8-12px base | 18-20px | 48-64px sections |
| 4-6 (Balanced) | Comfortable reading | 4-8px base | 16-18px | 24-32px sections |
| 7-8 (Compact) | Efficient use of space | 2-4px base | 14-16px | 16-20px sections |
| 9-10 (Dense) | Data-rich, power-user | 2px base | 12-14px | 8-12px sections |

### Setting Dials from a Brief

| Signal in Prompt | Variance | Motion | Density |
|-----------------|----------|--------|---------|
| "minimalist / clean / calm / editorial" | 4-5 | 2-3 | 2-3 |
| "premium / luxury / brand-forward" | 6-7 | 4-6 | 3-4 |
| "playful / experimental / agency" | 8-9 | 7-9 | 3-4 |
| "enterprise / B2B / professional" | 3-4 | 2-3 | 5-6 |
| "dark mode / tech / developer" | 5-6 | 4-5 | 4-5 |
| "warm / friendly / consumer" | 5-6 | 4-6 | 3-4 |
| "accessibility-first / public-sector" | 2-3 | 1-2 | 4-5 |

**Default: 5 / 5 / 5** — balanced, characterful, purposeful motion, comfortable density.

---

## 3. The Design Read (Brief Inference)

Before generating anything, perform a **design read**:

```
"Reading this as: <system kind> for <audience>,
 with a <vibe> language,
 leaning toward <design system family>,
 dials: V<variance> / M<motion> / D<density>"
```

**Example reads:**
- *"Reading this as: editorial system for a literary magazine, with a warm paper-and-ink language, leaning toward serif display + generous whitespace, dials: V5 / M3 / D3"*
- *"Reading this as: SaaS system for B2B technical buyers, with a Linear-minimalist language, leaning toward Inter + restrained color, dials: V4 / M4 / D5"*
- *"Reading this as: experimental portfolio for a creative agency, with a high-contrast kinetic language, leaning toward variable type + bold accent, dials: V8 / M8 / D3"*

**Signals to extract from every prompt:**
1. **System kind** — editorial, SaaS, portfolio, e-commerce, dashboard, docs, brand
2. **Audience** — consumers, enterprise, developers, designers, general public
3. **Vibe words** — warm, cold, playful, serious, minimal, ornate, tech, organic
4. **Reference signals** — brands, URLs, screenshots, competing products
5. **Quiet constraints** — accessibility, localization, platform, performance

If the brief is ambiguous, ask **one** clarifying question. Never guess.

---

## 4. Design System Creation with Taste

When authoring a DESIGN.md, let the three dials guide every section:

### §1 Visual Theme (driven by: vibe words + audience + variance)
- Low variance: "Clean, professional, readable. Convention with quality execution."
- High variance: "Provocative, memorable. Challenges expectations."
- *Always* give the theme an opinionated point of view — never "A modern design system."

### §2 Color (driven by: variance + brand direction)
- Low variance: 2-3 neutrals + 1 accent. WCAG AAA across the board.
- Mid variance: Warm/cool palette, 1-2 accents. AA minimum, AAA for text.
- High variance: Unexpected combinations, saturated hero colors. Accept AA-only.

### §3 Typography (driven by: variance + density)
- Low density: Larger body text (18-20px), generous leading (1.6-1.8)
- High density: Compact type (14-16px), tighter leading (1.4-1.5)
- Low variance: System sans + one weight
- High variance: Custom display + expressive pairing

### §4 Spacing (driven by: density dial)
- Low density: 8px base unit, 64px section padding
- High density: 4px base unit, 16px section padding
- *Let the spacing scale tell a story:* tight internal, generous external

### §5 Layout (driven by: variance)
- Low variance: Standard grid (12-column), centered content, predictable
- High variance: Asymmetric grids, broken layouts, intentional tension

### §6 Components (driven by: full dial profile)
- Each component specification should reference the system's taste character
- Button radii, card padding, input height — all flow from the dials

### §7 Motion (driven by: motion dial)
- Low: Instant transitions, no animation on critical path
- High: Scroll-triggered, parallax, spring physics

### §8 Voice (driven by: audience + variance)
- Enterprise: Clear, direct, accessible
- Consumer: Warm, friendly, human
- Experimental: Bold, distinctive, memorable

### §9 Anti-patterns (driven by: positive taste, inverted)
- What this system *doesn't* do is as important as what it does
- Each anti-pattern should map to a lint rule

---

## 5. Token Generation with Intent

When generating `tokens.css`, taste means:

- **Semantic hierarchy**: `--color-surface` (bg), `--color-surface-raised` (card), `--color-surface-overlay` (modal). Don't invent flat lists.
- **Spacing rhythm from the brief**: An editorial system gets generous spacing (8px unit, large section gaps). A dashboard gets compact spacing (4px unit, tight internal).
- **Radius as character**: 4px = precise/corporate. 8px = friendly/consumer. 16px = playful/brand. 0 = serious/industrial. 9999px = approachable/SaaS.
- **Accent budget**: Exactly one accent color. Maybe a second for status. Never five.
- **Font pairing logic**: Display font → personality. Body font → readability. Mono font → technical credibility. Pair them with intentional contrast (serif display + sans body, or geometric sans + humanist sans).
- **Shadow as depth, not decoration**: 1-2 levels max. Subtle for UI, slightly more for overlays.

---

## 6. Anti-Slop Checklist for Design Systems

Actively avoid these AI-generated defaults:

- ❌ **AI-purple gradients** (indigo-500 → purple-600) — reached for first by every LLM
- ❌ **Centered hero with three equal feature cards** — the most common AI layout pattern
- ❌ **Generic glassmorphism** — frosted glass as a default decorative move
- ❌ **Sans-only systems** — LLMs rarely reach for serif, even when appropriate
- ❌ **Inter + slate-900** — the default AI font stack (use it intentionally, not by habit)
- ❌ **Accent overuse** — accent color on every interactive element (buttons, links, icons, borders, badges)
- ❌ **Placeholder copy** — "Feature One", "Lorem ipsum", "© 2024" — real content shapes real design
- ❌ **Emoji as icons** — 🚀, ✨, 💡 used as primary iconography
- ❌ **Over-elevation** — 3+ shadow levels when 1-2 would do
- ❌ **No dark mode consideration** — generating only light mode as default, even for dark-first brands

---

## 7. Routing Table

| Task | Skill or Workflow |
|------|-------------------|
| Generate DESIGN.md from prompt | `workflow('ds-taste-profile', { prompt })` |
| Import a DESIGN.md | `workflow('ds-import', { source })` |
| Scaffold tokens + primitives | `workflow('ds-scaffold', { id, designMdPath })` |
| Build a new component | `component-build` skill |
| Edit an existing component | `component-build` with edit mode |
| Review component quality | `design-review` skill |
| Generate preview HTML | `workflow('ds-generate-preview', { id })` |
| Extract brand tokens | `brand-extract` skill |
| Reason about color | `color-expert` skill |
| Manage DS lint rules | `ds-lint-rules` skill |
| Compile + export tokens | `ds-compile` skill |
| Audit visual quality | `visual-quality` skill |

---

## 8. Taste in Review

When reviewing output (components, DESIGN.md, previews), evaluate against these criteria:

1. **Does this have a point of view?** — could it belong to any brand, or does it feel specific?
2. **Is there an intentional hierarchy?** — visual weight, spacing, and color should guide the eye
3. **Are the defaults challenged?** — is this just another centered card layout with purple gradient?
4. **Would a designer approve this?** — not just "is it technically correct" but "does it look good?"
5. **Is the accent used sparingly?** — accent should be the spice, not the main ingredient
