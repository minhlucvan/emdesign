import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps {
  /** Heading level (1–6) */
  level?: HeadingLevel;
  /** Heading content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const levelStyles: Record<HeadingLevel, React.CSSProperties> = {
  1: {
    fontSize: 'var(--font-size-display-xl)',
    fontWeight: 'var(--font-weight-display-xl)',
    lineHeight: 'var(--line-height-display-xl)',
    letterSpacing: 'var(--letter-spacing-display-xl)',
  },
  2: {
    fontSize: 'var(--font-size-display-lg)',
    fontWeight: 'var(--font-weight-display-lg)',
    lineHeight: 'var(--line-height-display-lg)',
    letterSpacing: 'var(--letter-spacing-display-lg)',
  },
  3: {
    fontSize: 'var(--font-size-headline)',
    fontWeight: 'var(--font-weight-headline)',
    lineHeight: 'var(--line-height-headline)',
    letterSpacing: 'var(--letter-spacing-headline)',
  },
  4: {
    fontSize: 'var(--font-size-subhead)',
    fontWeight: 'var(--font-weight-subhead)',
    lineHeight: 'var(--line-height-subhead)',
    letterSpacing: 'var(--letter-spacing-subhead)',
  },
  5: {
    fontSize: 'var(--font-size-card-title)',
    fontWeight: 'var(--font-weight-card-title)',
    lineHeight: 'var(--line-height-card-title)',
    letterSpacing: 'var(--letter-spacing-card-title)',
  },
  6: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-body)',
    lineHeight: 'var(--line-height-body)',
    letterSpacing: 'var(--letter-spacing-body)',
  },
};

/**
 * Heading component rendering h1–h6 using figmaSans with the
 * design system's type scale. Each level maps to a typography role:
 *
 * | Level | Role        | Size | Weight | Line-Height | Tracking     |
 * |-------|-------------|------|--------|-------------|--------------|
 * | h1    | display-xl  | 86px | 340    | 1.00        | -1.72px      |
 * | h2    | display-lg  | 64px | 340    | 1.10        | -0.96px      |
 * | h3    | headline    | 26px | 540    | 1.35        | -0.26px      |
 * | h4    | subhead     | 26px | 340    | 1.35        | -0.26px      |
 * | h5    | card-title  | 24px | 700    | 1.45        | 0            |
 * | h6    | body        | 18px | 320    | 1.45        | -0.26px      |
 *
 * All values reference CSS custom properties from the design system tokens.
 */
export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  children,
  style,
}) => {
  const Tag = `h${level}` as const;

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-ink)',
    margin: 0,
    fontFeatureSettings: '"kern"',
  };

  return (
    <Tag style={{ ...baseStyle, ...levelStyles[level], ...style }}>
      {children}
    </Tag>
  );
};

Heading.displayName = 'Heading';
