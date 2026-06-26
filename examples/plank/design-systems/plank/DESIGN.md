---
name: Plank
category: Editorial
surface: web
description: A warm, editorial-inspired system with a decisive terracotta accent. Clean, engineered calm.
version: 1.0.0
---

# Plank
> Category: Editorial
> Surface: web

A warm, editorial-inspired design system — generous whitespace, one decisive accent,
built for content-first interfaces.

## 1. Visual Theme & Atmosphere
Warm, editorial calm. Near-white paper (`#fbfaf7`) canvas with a terracotta accent
(`#c7512e`). Ultra-thin translucent borders. Content feels airy and intentional.

## 2. Color
- **Surface:** `#fbfaf7` · **Surface raised:** `#ffffff`
- **Text:** `#1a1714` · **Text muted:** `#6b645c`
- **Accent:** `#c7512e` · **Accent hover:** `#a33d1e`
- **Border:** `#e6e1d8`
- **Success:** `#3f6b42` · **Warn:** `#9a6b1f` · **Danger:** `#963228`

## 3. Typography
- **Display:** `Inter` (700/1.1) · **Heading 1:** `Inter` (600/1.2/32px)
- **Heading 2:** `Inter` (600/1.3/24px) · **Heading 3:** `Inter` (600/1.4/20px)
- **Body:** `Inter` (400/1.6/16px) · **Body small:** `Inter` (400/1.5/14px)
- **Mono:** `JetBrains Mono` (400/1.5/13px)
- **Label:** `Inter` (600/1/12px uppercase)

## 4. Spacing
Base unit: `8px`. Scale: 2× (16px), 3× (24px), 4× (32px), 6× (48px), 8× (64px), 12× (96px).

## 5. Layout & Composition
Max-width: `1180px` · Section Y: `96px` · Two-column grid at 1024px+.
Whitespace-dominant — let content breathe.

## 6. Components
- **Button:** bg-accent/text-white/12px rounded/8px 16px padding. Hover: bg-accent-hover.
- **Card:** bg-surface-raised/1px border/12px rounded/20px padding.
- **Badge:** bg-accent/10px rounded/4px 8px padding/12px font.
- **Input:** bg-surface/1px border/8px rounded/10px 12px padding.
- **Heading:** 3 sizes (h1/h2/h3) + eyebrow (12px uppercase tracked).

## 7. Motion & Interaction
Base duration: `200ms` · Ease: `cubic-bezier(0.2, 0, 0, 1)`.
Only interactive elements animate (hover, focus, enter/exit). No animation on
scroll or load unless explicitly authored.

## 8. Voice & Brand
Warm, direct, editorial. Prefer active voice. Short sentences. No jargon.
"Plank is the foundation for your content."

## 9. Anti-patterns
- Never pure white text on light backgrounds
- Never indigo/purple gradients (AI-default look)
- Never emoji as icons in headings or buttons
- Never filler copy or Lorem ipsum
- Never `Math.random()` or `new Date()` in components

## 10. Tokens
See `tokens.css` for the machine contract.
