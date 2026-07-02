import React from 'react';
import { StatCell } from './StatCell';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatRowItem {
  /** Large numeric value displayed prominently (e.g. "100M+"). */
  value: string;
  /** Label text shown below the value. */
  label: string;
}

export interface StatRowProps {
  /** Array of stat items to display in the row. */
  items: StatRowItem[];
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 'var(--space-xxl)',
  padding: 'var(--space-section-sm) var(--space-xxl)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-xl)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  minWidth: 0,
};

// ---------------------------------------------------------------------------
// StatRow component
// ---------------------------------------------------------------------------

/**
 * `StatRow` — a grid-based statistics row for the Miro design system.
 *
 * Renders a horizontal grid of stat callouts, each composed of a large
 * numeric value (stat-display: 64px / 500 / 1.10 / -1.5px) with a
 * body-sm label beneath. The grid auto-fits columns at a 180px minimum
 * so items wrap responsively.
 *
 * The container uses the surface background colour, 16px corner radius,
 * and generous padding matching the Miro reference stat-row pattern.
 *
 * All colors, spacing, and typography bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <StatRow
 *   items={[
 *     { value: '100M+', label: 'Users worldwide' },
 *     { value: '250+',  label: 'Templates available' },
 *     { value: '6,200+', label: 'Enterprise clients' },
 *   ]}
 * />
 * ```
 */
export function StatRow({
  items,
  className,
  style,
}: StatRowProps) {
  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
    >
      {items.map((item, index) => (
        <StatCell
          key={index}
          value={item.value}
          label={item.label}
        />
      ))}
    </div>
  );
}

StatRow.displayName = 'StatRow';

export default StatRow;
