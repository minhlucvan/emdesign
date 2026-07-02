import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatItem {
  /** The primary numeric or textual value to display (e.g. "100M+", "99.9%"). */
  value: string | number;
  /** The label describing the stat (e.g. "Users", "Uptime"). */
  label: string;
  /** Optional trend indicator. */
  trend?: 'up' | 'down' | 'neutral';
}

export interface StatRowProps {
  /** Array of stat items to render in the grid row. */
  items: StatItem[];
  /** Number of grid columns (defaults to `items.length`, clamped 1–6). */
  columns?: number;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const gridStyle: React.CSSProperties = {
  display: 'grid',
  boxSizing: 'border-box',
  width: '100%',
};

const statCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-xxs)',
  padding: 'var(--space-md)',
  textAlign: 'center',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
};

const valueStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-heading-2)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 'var(--line-height-heading-2)',
  letterSpacing: '-0.5px',
  color: 'var(--color-text-heading)',
  margin: 0,
  boxSizing: 'border-box',
  fontFamily: 'var(--font-family-primary)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  margin: 0,
  boxSizing: 'border-box',
};

const trendUpStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  color: 'var(--color-accent)',
  margin: 0,
};

const trendDownStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  color: 'var(--color-text-muted)',
  margin: 0,
};

const trendNeutralStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  color: 'var(--color-text-muted)',
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: 'var(--space-section)',
  backgroundColor: 'var(--miro-hairline-soft)',
  flexShrink: 0,
};

// ---------------------------------------------------------------------------
// StatRow component
// ---------------------------------------------------------------------------

/**
 * `StatRow` — grid row of statistics for the Miro design system.
 *
 * Renders a CSS grid row of stat items, each showing a prominent value and
 * description label. Items are separated by a soft vertical hairline divider.
 * Supports up to 6 columns; defaults to as many columns as there are items.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <StatRow
 *   items={[
 *     { value: '100M+', label: 'Users' },
 *     { value: '99.9%', label: 'Uptime' },
 *     { value: '190+', label: 'Countries' },
 *     { value: '45M', label: 'Whiteboards' },
 *   ]}
 *   columns={4}
 * />
 * ```
 */
export function StatRow({
  items,
  columns,
  className,
  style,
  ...rest
}: StatRowProps) {
  const colCount = columns ?? Math.min(items.length, 6);
  const clampedColCount = Math.max(1, Math.min(colCount, 6));

  const trendSymbol: Record<string, string> = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div
      className={className}
      style={{
        ...gridStyle,
        gridTemplateColumns: `repeat(${clampedColCount}, 1fr)`,
        ...style,
      }}
      role="list"
      aria-label="Statistics"
      {...rest}
    >
      {items.slice(0, clampedColCount).map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <div style={dividerStyle} role="separator" aria-hidden />}
          <div style={statCardStyle} role="listitem">
            <span style={valueStyle}>{item.value}</span>
            <span style={labelStyle}>{item.label}</span>
            {item.trend && (
              <span
                style={
                  item.trend === 'up'
                    ? trendUpStyle
                    : item.trend === 'down'
                      ? trendDownStyle
                      : trendNeutralStyle
                }
                aria-label={`${item.trend} trend`}
              >
                {trendSymbol[item.trend]} {item.trend}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

StatRow.displayName = 'StatRow';

export default StatRow;
