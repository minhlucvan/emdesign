import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RadiusFeatureVariant =
  | 'default'
  | 'yellow'
  | 'coral'
  | 'teal'
  | 'rose'
  | 'dark';

export interface RadiusFeatureProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the feature panel.
   * - `default`: White/light surface, standard text.
   * - `yellow`: Brand-yellow background for brand-highlight callouts.
   * - `coral`: Pastel coral background for warm feature sections.
   * - `teal`: Pastel teal background for cool feature sections.
   * - `rose`: Pastel rose background for soft feature sections.
   * - `dark`: Dark ink background with on-dark text (hero CTA banner).
   */
  variant?: RadiusFeatureVariant;
  /** Feature panel content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Variant style map — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const variantStyles: Record<RadiusFeatureVariant, React.CSSProperties> = {
  default: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  },
  yellow: {
    background: 'var(--miro-brand-yellow)',
    color: 'var(--color-ink)',
  },
  coral: {
    background: 'var(--miro-coral-light)',
    color: 'var(--color-ink)',
  },
  teal: {
    background: 'var(--miro-teal-light)',
    color: 'var(--color-ink)',
  },
  rose: {
    background: 'var(--miro-rose-light)',
    color: 'var(--color-ink)',
  },
  dark: {
    background: 'var(--color-ink)',
    color: 'var(--color-text-on-dark)',
  },
};

// ---------------------------------------------------------------------------
// Base style — shared across all variants
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-feature)',
  padding: 'var(--space-section)',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// RadiusFeature component
// ---------------------------------------------------------------------------

/**
 * `RadiusFeature` — feature panel with the signature Miro 32px border radius.
 *
 * A large-radius container for hero CTA banners, pastel feature callouts, and
 * brand-highlight sections. Every visual property binds to a Miro design system
 * CSS custom property — no raw hex values, no hardcoded spacing.
 *
 * The `--radius-feature` token (32px) is the largest non-pill radius in the
 * Miro system, reserved for high-visibility feature panels that need to stand
 * apart from standard cards (`--radius-xxxl`: 28px) and pricing panels
 * (`--radius-xl`: 16px).
 *
 * Six variants cover the full spectrum of Miro's feature surface treatments:
 * - **default** — white/light surface for neutral feature panels
 * - **yellow** — brand-yellow filled panel (wordmark-adjacent emphasis)
 * - **coral** — pastel coral filled panel
 * - **teal** — pastel teal filled panel
 * - **rose** — pastel rose filled panel
 * - **dark** — dark ink filled panel with white-on-dark text
 *
 * Per Miro anti-patterns, feature panels are **borderless** — no borders or
 * shadows are applied. Elevation is reserved for whiteboard mockups and modals.
 *
 * ```tsx
 * <RadiusFeature variant="dark">
 *   <Heading level={2}>Get started free</Heading>
 *   <Button variant="primary">Try Miro</Button>
 * </RadiusFeature>
 *
 * <RadiusFeature variant="coral">
 *   <Heading level={3}>Visual collaboration</Heading>
 *   <Text variant="body">Brainstorm on an infinite canvas.</Text>
 * </RadiusFeature>
 * ```
 */
export const RadiusFeature = React.forwardRef<HTMLDivElement, RadiusFeatureProps>(
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

RadiusFeature.displayName = 'RadiusFeature';

export default RadiusFeature;
