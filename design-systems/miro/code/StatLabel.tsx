import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Additional class names for custom styling. */
  className?: string;
  /** Label text content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  margin: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// StatLabel component
// ---------------------------------------------------------------------------

/**
 * `StatLabel` — descriptive label for a statistic value in the Miro design
 * system.
 *
 * Renders a small, muted `<span>` element in Miro's body-sm (14px) typography
 * with regular weight and muted text color. Designed for use below or beside a
 * prominent stat value to describe what the number represents (e.g. "Users
 * worldwide", "Active projects", "Countries").
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <StatLabel>Users worldwide</StatLabel>
 * <StatLabel>Active projects</StatLabel>
 * ```
 */
export function StatLabel({
  className,
  style,
  children,
  ...rest
}: StatLabelProps) {
  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

StatLabel.displayName = 'StatLabel';

export default StatLabel;
