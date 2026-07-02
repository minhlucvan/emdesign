import React from 'react';

export type StackDirection = 'row' | 'column';
export type SpacingToken =
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'huge';
export type AlignItems =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'stretch'
  | 'baseline';
export type JustifyContent =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  gap?: SpacingToken;
  align?: AlignItems;
  justify?: JustifyContent;
  children?: React.ReactNode;
}

/* ---- Static style maps ---- */

const GAP_MAP: Record<SpacingToken, string> = {
  xxs: 'var(--space-xxs)',
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
  xxl: 'var(--space-xxl)',
  huge: 'var(--space-huge)',
};

/* ---- Component ---- */

const Stack: React.FC<StackProps> = ({
  direction = 'row',
  gap = 'md',
  align,
  justify,
  style,
  children,
  ...props
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: GAP_MAP[gap],
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Stack;
