---
name: design-taste-dials
description: Standalone reference for the three-dial design taste system — DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY. Referenced by workflows and other skills. Adapted from taste-skill (Leonxlnx).
---

# The Three Dials: Design Taste Reference

## DESIGN_VARIANCE

*How opinionated, bold, or experimental the design system is.*

| Value | Label | Token Character | Layout | Color |
|-------|-------|----------------|--------|-------|
| 1 | Ultra-conservative | Standard everything | Conventional grid | 2 neutrals + 1 accent |
| 2 | Safe | System defaults | 12-col centered | WCAG AAA everywhere |
| 3 | Conventional | One personality move | Standard with flair | Safe palette |
| 4 | Restrained | Subtle character | Slight asymmetry | Warm/cool shift |
| 5 | **Balanced** | **Distinctive but not loud** | **Editorial layout** | **1-2 accents** |
| 6 | Characterful | Clear identity | Broken grid hints | Saturated accent |
| 7 | Bold | Unusual combos | Asymmetric sections | High contrast |
| 8 | Expressive | Strong opinion | Intentional tension | Unexpected pairings |
| 9 | Provocative | Pushes boundaries | Avant-garde | Clashing/neon |
| 10 | Avant-garde | Extreme expression | Layout as art | Duotone/monochrome |

## MOTION_INTENSITY

*How much motion and animation the design system employs.*

| Value | Label | Durations | Easing | What Animates |
|-------|-------|-----------|--------|--------------|
| 1 | Frozen | 0ms | — | Nothing |
| 2 | Static | 0-50ms | Linear | Only :hover |
| 3 | Minimal | 50-100ms | Linear | :hover + :focus |
| 4 | Subtle | 100-200ms | Ease-out | State changes |
| 5 | **Purposeful** | **150-300ms** | **Ease-in-out** | **Feedback + transitions** |
| 6 | Smooth | 200-350ms | Custom ease | Layout enter/exit |
| 7 | Expressive | 300-500ms | Spring | Parallax, scroll-triggered |
| 8 | Dynamic | 400-600ms | Physics | Page transitions |
| 9 | Cinematic | 500-800ms | Custom spring | Kinetic typography |
| 10 | Kinetic | 800ms+ | Bounce/overlay | Narrative animation |

## VISUAL_DENSITY

*How much information is packed into each view.*

| Value | Label | Spacing Unit | Body Type | Section Padding | Content Width |
|-------|-------|-------------|-----------|----------------|--------------|
| 1 | Gallery | 12px base | 20px | 64-80px | 720px max |
| 2 | Airy | 10px base | 19px | 56-72px | 768px max |
| 3 | Spacious | 8px base | 18px | 48-64px | 840px max |
| 4 | Comfortable | 8px base | 17px | 40-56px | 960px max |
| 5 | **Balanced** | **6px base** | **16px** | **32-48px** | **1024px max** |
| 6 | Standard | 6px base | 16px | 28-40px | 1100px max |
| 7 | Compact | 4px base | 15px | 24-32px | 1200px max |
| 8 | Tight | 4px base | 14px | 20-24px | 1280px max |
| 9 | Dense | 2px base | 13px | 16-20px | Full width |
| 10 | Cockpit | 2px base | 12px | 8-16px | Full width |

## Use-Case Presets

| Use Case | Variance | Motion | Density |
|----------|----------|--------|---------|
| Editorial / Literary | 5 | 3 | 3 |
| SaaS Landing | 5 | 5 | 4 |
| B2B Dashboard | 3 | 2 | 6 |
| E-commerce | 5 | 4 | 5 |
| Portfolio (Creative) | 8 | 7 | 3 |
| Portfolio (Dev) | 4 | 4 | 5 |
| Documentation | 3 | 2 | 4 |
| Mobile App | 5 | 5 | 5 |
| Brand / Marketing | 6 | 5 | 3 |
| Enterprise Admin | 2 | 1 | 6 |
| Dark / Tech | 5 | 5 | 5 |
| Consumer / Friendly | 6 | 5 | 4 |
| Public Sector | 2 | 1 | 4 |
| Agency / Experimental | 8 | 8 | 3 |

## Anti-Default Discipline

When setting dials, default values should raise suspicion:

| Default AI Pattern | Better Alternative |
|--------------------|-------------------|
| Inter + slate-900 | System font or a paired family |
| Violet/indigo gradient | One saturated accent, applied sparingly |
| Centered hero layout | Asymmetric hero or content-led layout |
| Three equal feature cards | Varied card sizes, staggered grid |
| Glassmorphism | Solid surfaces with subtle shadow |
| Emoji as icons | Minimal geometric icons or no icons |
| Rounded-2xl everywhere | Varied radius by element function |
| Accent on everything | Accent on ≤2 elements per view |
