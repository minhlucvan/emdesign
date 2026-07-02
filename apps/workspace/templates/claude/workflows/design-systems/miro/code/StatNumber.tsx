import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatNumberProps {
  /** Large numeric value displayed prominently (e.g. "100M+"). */
  value: string;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const rootStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-stat-display)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.1,
  letterSpacing: '-0.0234375em',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-sans)',
  margin: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// StatNumber component
// ---------------------------------------------------------------------------

/**
 * `StatNumber` — a single stat-display numeric value for the Miro design system.
 *
 * Renders a large numeric value using the stat-display type scale
 * (64px / 500 / 1.10 / -1.5px) without any accompanying label. Designed for
 * use inside a CSS Grid layout such as the stat-row pattern found in the
 * Miro reference.
 *
 * All colors, typography, and spacing bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <StatNumber value="100M+" />
 * ```
 */
export function StatNumber({
  value,
  className,
  style,
}: StatNumberProps) {
  return (
    <span
      className={className}
      style={{
        ...rootStyle,
        ...style,
      }}
    >
      {value}
    </span>
  );
}

StatNumber.displayName = 'StatNumber';

export default StatNumber;
