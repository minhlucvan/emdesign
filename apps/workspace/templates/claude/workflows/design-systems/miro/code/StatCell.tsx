import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatCellProps {
  /** Large numeric value displayed prominently (e.g. "100M+"). */
  value: string;
  /** Label text shown below the value. */
  label: string;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
  alignItems: 'flex-start',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const valueStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-stat-display)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.1,
  letterSpacing: '-0.0234375em',
  color: 'var(--color-text)',
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--color-text-tertiary)',
  margin: 0,
};

// ---------------------------------------------------------------------------
// StatCell component
// ---------------------------------------------------------------------------

/**
 * `StatCell` — a single statistic callout for the Miro design system.
 *
 * Renders a vertically-stacked numeric value and label, matching the
 * stat-display type scale (64px / 500 / 1.10 / -1.5px) with tertiary
 * body-sm label text. Designed to be placed inside a CSS Grid container
 * such as the stat-row pattern found in the Miro reference.
 *
 * All colors, typography, and spacing bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <StatCell value="100M+" label="Users worldwide" />
 * ```
 */
export function StatCell({
  value,
  label,
  className,
  style,
}: StatCellProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
    >
      <span style={valueStyle}>{value}</span>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

StatCell.displayName = 'StatCell';

export default StatCell;
