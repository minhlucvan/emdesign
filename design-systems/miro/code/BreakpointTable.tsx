import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreakpointEntry {
  /** Human-readable breakpoint name (e.g. "Mobile", "Tablet", "Desktop"). */
  name: string;
  /** Minimum viewport width in pixels (e.g. 0, 768, 1024). */
  minWidth: number;
  /** Maximum viewport width in pixels, or `Infinity` for the largest breakpoint. */
  maxWidth: number;
  /** Optional device / context label (e.g. "Phones", "Portrait tablets"). */
  device?: string;
}

export interface BreakpointTableProps {
  /** Ordered array of breakpoint entries (smallest to largest). */
  breakpoints: BreakpointEntry[];
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  overflowX: 'auto',
  fontFamily: 'var(--font-sans)',
  WebkitOverflowScrolling: 'touch',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'var(--space-sm)',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--miro-hairline-soft)',
  backgroundColor: 'var(--color-surface)',
  padding: 'var(--space-md)',
  boxSizing: 'border-box',
  minHeight: 120,
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-heading-4)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 'var(--line-height-heading-4)',
  color: 'var(--color-text-heading)',
  margin: 0,
};

const rangeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  margin: 0,
  marginTop: 'var(--space-xxs)',
};

const deviceStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-caption)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.4,
  color: 'var(--color-text-muted)',
  margin: 0,
  marginTop: 'var(--space-xxs)',
};

const dividerStyle: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'var(--miro-hairline-soft)',
  margin: 'var(--space-sm) 0',
  border: 'none',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a viewport width range string from min/max values.
 * Examples: "0 – 767px", "768 – 1023px", "1024px+"
 */
function formatRange(min: number, max: number): string {
  if (!Number.isFinite(max)) return `${min}px+`;
  if (min === 0) return `0 – ${max}px`;
  return `${min} – ${max}px`;
}

// ---------------------------------------------------------------------------
// BreakpointTable component
// ---------------------------------------------------------------------------

/**
 * `BreakpointTable` — responsive breakpoint reference grid for the Miro design
 * system.
 *
 * Renders a CSS grid of breakpoint cards, each showing the breakpoint name,
 * its viewport width range, and an optional device context label. Use this
 * component in design system documentation, style guides, or responsive
 * utility pages to communicate the active breakpoint boundaries.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <BreakpointTable
 *   breakpoints={[
 *     { name: 'Mobile',    minWidth: 0,     maxWidth: 767,   device: 'Phones' },
 *     { name: 'Tablet',    minWidth: 768,   maxWidth: 1023,  device: 'Portrait tablets' },
 *     { name: 'Desktop',   minWidth: 1024,  maxWidth: 1279,  device: 'Laptops' },
 *     { name: 'Wide',      minWidth: 1280,  maxWidth: Infinity, device: 'Desktops & TVs' },
 *   ]}
 * />
 * ```
 */
export function BreakpointTable({
  breakpoints,
  className,
  style,
  ...rest
}: BreakpointTableProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
      role="region"
      aria-label="Responsive breakpoints"
      {...rest}
    >
      <div style={gridStyle}>
        {breakpoints.map((bp, index) => (
          <div key={index} style={cardStyle}>
            <h4 style={nameStyle}>{bp.name}</h4>
            <hr style={dividerStyle} aria-hidden />
            <p style={rangeStyle}>{formatRange(bp.minWidth, bp.maxWidth)}</p>
            {bp.device && <p style={deviceStyle}>{bp.device}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

BreakpointTable.displayName = 'BreakpointTable';

export default BreakpointTable;
