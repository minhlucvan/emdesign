import React from 'react';

type StackDirection = 'row' | 'col';
type StackGap = 'hair' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'section';

export interface StackProps {
  /** Flex direction */
  direction?: StackDirection;
  /** Gap between children — maps to a spacing CSS custom property */
  gap?: StackGap;
  /** Whether items wrap onto multiple lines */
  wrap?: boolean;
  /** Horizontal alignment (align-items) */
  align?: React.CSSProperties['alignItems'];
  /** Vertical / main-axis alignment (justify-content) */
  justify?: React.CSSProperties['justifyContent'];
  /** Stack content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const gapTokens: Record<StackGap, string> = {
  hair: 'var(--spacing-hair)',
  xxs: 'var(--spacing-xxs)',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  xxl: 'var(--spacing-xxl)',
  section: 'var(--spacing-section)',
};

/**
 * Flex layout wrapper with direction and gap props.
 *
 * Maps the `gap` prop directly to Figma spacing CSS custom properties:
 * `xs` -> `--spacing-xs` (8px), `md` -> `--spacing-md` (16px), etc.
 *
 * Supports `row` (horizontal) and `col` (vertical) directions,
 * with optional wrapping and alignment controls.
 *
 * Designed as a minimal layout primitive — compose other components
 * inside Stack rather than adding layout styles to them directly.
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'col',
  gap = 'md',
  wrap = false,
  align,
  justify,
  children,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'row' ? 'row' : 'column',
        gap: gapTokens[gap],
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

Stack.displayName = 'Stack';
