import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level: 1 (largest) through 6 (smallest). Defaults to 2. */
  level?: HeadingLevel;
  /** Additional class names for custom styling. */
  className?: string;
  /** Heading content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Per-level heading styles — every value binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const headingStyles: Record<HeadingLevel, React.CSSProperties> = {
  1: {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-heading-1)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-heading-1)',
    letterSpacing: 'var(--letter-spacing-heading-1)',
  },
  2: {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-heading-2)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-heading-2)',
    letterSpacing: 'var(--letter-spacing-heading-2)',
  },
  3: {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-heading-3)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-heading-3)',
  },
  4: {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-heading-4)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-heading-4)',
  },
  5: {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-heading-5)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-heading-5)',
  },
  6: {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-heading-5)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-heading-5)',
  },
};

const headingTags: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

// ---------------------------------------------------------------------------
// Base style — shared across all heading levels
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  color: 'var(--color-text-heading)',
  margin: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Heading component
// ---------------------------------------------------------------------------

/**
 * `Heading` — heading element for the Miro design system.
 *
 * Renders a semantic `<h1>`–`<h6>` element with Roobert PRO typography at 500
 * weight, sized and spaced per the Miro type scale. Every visual property
 * binds to a Miro CSS custom property — no raw hex values, no hardcoded
 * spacing.
 *
 * | Level | Token               | Size | Weight | Line-Height | Letter-Spacing |
 * |-------|---------------------|------|--------|-------------|----------------|
 * | 1     | `--type-heading-1`  | 48px | 500    | 1.15        | -1px           |
 * | 2     | `--type-heading-2`  | 36px | 500    | 1.20        | -0.5px         |
 * | 3     | `--type-heading-3`  | 28px | 500    | 1.25        | 0              |
 * | 4     | `--type-heading-4`  | 22px | 500    | 1.30        | 0              |
 * | 5     | `--type-heading-5`  | 18px | 500    | 1.40        | 0              |
 * | 6     | (falls back to h5)  | 18px | 500    | 1.40        | 0              |
 *
 * ```tsx
 * <Heading level={1}>See how teams get great done with Miro</Heading>
 * <Heading level={2}>AI-powered workflows</Heading>
 * <Heading level={3}>Visual collaboration platform</Heading>
 * ```
 *
 * When used inside feature cards or CTA banners, wrap in a container that
 * supplies the appropriate spacing tokens (e.g. `--space-xl` vertical gap).
 */
export function Heading({
  level = 2,
  className,
  style,
  children,
  ...rest
}: HeadingProps) {
  const Tag = headingTags[level];

  return (
    <Tag
      className={className}
      style={{
        ...baseStyle,
        ...headingStyles[level],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

Heading.displayName = 'Heading';

export default Heading;
