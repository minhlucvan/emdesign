import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatLabelProps {
  /** Label text describing the stat value. */
  children: React.ReactNode;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const rootStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--color-text-tertiary)',
  fontFamily: 'var(--font-sans)',
  margin: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// StatLabel component
// ---------------------------------------------------------------------------

/**
 * `StatLabel` — a single stat label for the Miro design system.
 *
 * Renders a label text using the body-sm type scale (14px / 400 / 1.50) in the
 * tertiary text colour. Designed to accompany `StatNumber` inside a container
 * such as the stat-row pattern found in the Miro reference.
 *
 * All colors, typography, and spacing bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <StatLabel>Users worldwide</StatLabel>
 * ```
 */
export function StatLabel({
  children,
  className,
  style,
}: StatLabelProps) {
  return (
    <span
      className={className}
      style={{
        ...rootStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

StatLabel.displayName = 'StatLabel';

export default StatLabel;
