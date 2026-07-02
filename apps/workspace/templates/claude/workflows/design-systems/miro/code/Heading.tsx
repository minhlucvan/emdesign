import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeadingProps {
  /** Heading level: 1 → heading-1 (48/500/1.15/-1px), 2 → heading-2 (36/500/1.20/-0.5px), 3 → heading-3 (28/500/1.25) */
  level?: 1 | 2 | 3;
  /** Heading text content */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  margin: 0,
  boxSizing: 'border-box',
};

type LevelStyles = Record<Required<HeadingProps['level']>, React.CSSProperties>;

const levelStyles: LevelStyles = {
  1: {
    fontSize: 'var(--font-size-heading-1)',
    lineHeight: 1.15,
    letterSpacing: '-0.021em', // -1px at 48px
  },
  2: {
    fontSize: 'var(--font-size-heading-2)',
    lineHeight: 1.20,
    letterSpacing: '-0.014em', // -0.5px at 36px
  },
  3: {
    fontSize: 'var(--font-size-heading-3)',
    lineHeight: 1.25,
    letterSpacing: 0,
  },
};

// ---------------------------------------------------------------------------
// Heading component
// ---------------------------------------------------------------------------

/**
 * Heading primitive for the Miro design system.
 *
 * Renders a semantic heading element (h1-h3) using design-system type scale
 * tokens. All colors and typography reference CSS custom properties — no raw
 * values or hardcoded pixels.
 *
 * ```tsx
 * <Heading level={1}>Design System Analysis of Miro</Heading>
 * <Heading level={2}>Color Palette</Heading>
 * <Heading level={3}>Card Title</Heading>
 * ```
 */
export const Heading = ({
  level = 1,
  children,
  className,
  style,
  ...rest
}: HeadingProps & React.HTMLAttributes<HTMLHeadingElement>) => {
  const resolvedLevel = level >= 1 && level <= 3 ? level : 1;
  const levelStyle = levelStyles[resolvedLevel];
  const Tag = `h${resolvedLevel}` as const;

  return (
    <Tag
      className={className}
      style={{
        ...baseStyle,
        ...levelStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

Heading.displayName = 'Heading';

export default Heading;
