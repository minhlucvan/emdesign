import React from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

/* ---- Static style maps ---- */

const TAG_MAP: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text)',
  margin: 0,
};

const levelStyle: Record<HeadingLevel, React.CSSProperties> = {
  1: {
    fontSize: 'var(--font-size-display-xxl)',
    fontWeight: 'var(--font-weight-display-xxl)',
    lineHeight: 'var(--line-height-display-xxl)',
    letterSpacing: 'var(--letter-spacing-display-xxl)',
  },
  2: {
    fontSize: 'var(--font-size-display-xl)',
    fontWeight: 'var(--font-weight-display-xl)',
    lineHeight: 'var(--line-height-display-xl)',
    letterSpacing: 'var(--letter-spacing-display-xl)',
  },
  3: {
    fontSize: 'var(--font-size-display-lg)',
    fontWeight: 'var(--font-weight-display-lg)',
    lineHeight: 'var(--line-height-display-lg)',
    letterSpacing: 'var(--letter-spacing-display-lg)',
  },
  4: {
    fontSize: 'var(--font-size-display-md)',
    fontWeight: 'var(--font-weight-display-md)',
    lineHeight: 'var(--line-height-display-md)',
    letterSpacing: 'var(--letter-spacing-display-md)',
  },
  5: {
    fontSize: 'var(--font-size-heading-lg)',
    fontWeight: 'var(--font-weight-heading-lg)',
    lineHeight: 'var(--line-height-heading-lg)',
    letterSpacing: 'var(--letter-spacing-heading-lg)',
  },
  6: {
    fontSize: 'var(--font-size-heading-md)',
    fontWeight: 'var(--font-weight-heading-md)',
    lineHeight: 'var(--line-height-heading-md)',
    letterSpacing: 'var(--letter-spacing-heading-md)',
  },
};

/* ---- Component ---- */

const Heading: React.FC<HeadingProps> = ({
  level = 1,
  style,
  children,
  ...props
}) => {
  const Tag = TAG_MAP[level];

  return (
    <Tag
      style={{
        ...baseStyle,
        ...levelStyle[level],
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Heading;
