import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RadiusPillVariant =
  | 'default'
  | 'outline'
  | 'brand-yellow'
  | 'accent'
  | 'dark';

export interface RadiusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the pill element.
   * - `default`: Light surface background with standard text — for neutral pill tags and toggle-pill segments.
   * - `outline`: Transparent background with border — for secondary pill buttons and filter dropdowns.
   * - `brand-yellow`: Brand-yellow fill with ink text — for promo badges and callout chips.
   * - `accent`: Brand-blue fill with on-dark text — for highlighted/featured pill CTAs.
   * - `dark`: Ink fill with on-dark text — for active pill-tab segments and primary CTAs.
   */
  variant?: RadiusPillVariant;
  /** Pill content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Variant style map — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const variantStyles: Record<RadiusPillVariant, React.CSSProperties> = {
  default: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  'brand-yellow': {
    background: 'var(--miro-brand-yellow)',
    color: 'var(--color-ink)',
    border: 'none',
  },
  accent: {
    background: 'var(--color-accent)',
    color: 'var(--color-text-on-dark)',
    border: 'none',
  },
  dark: {
    background: 'var(--color-ink)',
    color: 'var(--color-text-on-dark)',
    border: 'none',
  },
};

// ---------------------------------------------------------------------------
// Base style — shared across all variants
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-xs) var(--space-sm)',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  whiteSpace: 'nowrap',
};

// ---------------------------------------------------------------------------
// RadiusPill component
// ---------------------------------------------------------------------------

/**
 * `RadiusPill` — pill-shaped container with the signature Miro 9999px border radius.
 *
 * A pill-form container for badges, promo chips, toggle-pill segments, filter
 * dropdowns, and other compact pill-shaped UI elements. Every visual property
 * binds to a Miro design system CSS custom property — no raw hex values, no
 * hardcoded spacing.
 *
 * The `--radius-pill` token (9999px) is the fully rounded corner value used
 * by every pill element in the Miro system — all buttons, tabs, badges, and
 * filter dropdowns. Zero dead zone in the corner.
 *
 * Five variants cover the spectrum of Miro's pill surface treatments:
 * - **default** — light surface for neutral chips and toggle segments
 * - **outline** — transparent with border for secondary/outlined pills
 * - **brand-yellow** — brand-yellow filled for promo badges and callout chips
 * - **accent** — brand-blue filled for highlighted pill CTAs
 * - **dark** — ink filled with white-on-dark text for primary CTAs and active tabs
 *
 * Per Miro design rules, pills are predominantly flat (no shadow); elevation
 * is reserved for whiteboard mockups and modals.
 *
 * ```tsx
 * <RadiusPill variant="brand-yellow">Limited time</RadiusPill>
 * <RadiusPill variant="outline">Filter ⌄</RadiusPill>
 * <RadiusPill variant="dark">Active tab</RadiusPill>
 * ```
 */
export const RadiusPill = React.forwardRef<HTMLDivElement, RadiusPillProps>(
  ({ variant = 'default', children, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

RadiusPill.displayName = 'RadiusPill';

export default RadiusPill;
