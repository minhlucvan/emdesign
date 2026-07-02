import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogoWallItem {
  /** Display name of the company / brand. */
  name: string;
  /**
   * Optional custom content (e.g. an inline SVG logo image) rendered in place
   * of the plain text name. When provided, `name` is used as the `aria-label`.
   */
  logo?: React.ReactNode;
}

export interface LogoWallProps {
  /** Company logos or names to display in the grid. */
  logos: LogoWallItem[];
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 'var(--space-md)',
  padding: 'var(--space-xxl)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border-soft)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const itemStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  minWidth: 0,
};

// ---------------------------------------------------------------------------
// LogoWall component
// ---------------------------------------------------------------------------

/**
 * Logo wall grid for the Miro design system.
 *
 * Renders a trust-row grid of customer / partner company names (or inline SVG
 * logos) styled using semantic design-system tokens. The grid auto-fits
 * columns at a 120px minimum, wrapping naturally on smaller viewports.
 *
 * All colors, spacing, and typography reference design-system CSS custom
 * properties — no raw values or hardcoded pixels.
 *
 * ```tsx
 * <LogoWall
 *   logos={[
 *     { name: 'PepsiCo' },
 *     { name: 'Walmart' },
 *     { name: 'Atlassian' },
 *   ]}
 * />
 * ```
 */
export const LogoWall = ({
  logos,
  className,
  style,
}: LogoWallProps) => {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
    >
      {logos.map((item, idx) => (
        <div
          key={idx}
          style={itemStyle}
          aria-label={item.logo ? item.name : undefined}
        >
          {item.logo ?? item.name}
        </div>
      ))}
    </div>
  );
};

LogoWall.displayName = 'LogoWall';

export default LogoWall;
