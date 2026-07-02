import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogoItemProps {
  /** Display name of the company / brand. */
  name: string;
  /**
   * Optional custom content (e.g. an inline SVG logo) rendered in place of the
   * plain text name. When provided, `name` is used as the `aria-label`.
   */
  logo?: React.ReactNode;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  textAlign: 'center',
  color: 'var(--color-text-tertiary)',
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  minWidth: 0,
};

// ---------------------------------------------------------------------------
// LogoItem component
// ---------------------------------------------------------------------------

/**
 * `LogoItem` — single logo / brand cell for the Miro design system.
 *
 * Renders a centered grid cell displaying either a company name as plain text,
 * or custom content (e.g. an inline SVG logo) via the `logo` prop. Designed to
 * be placed inside a CSS Grid container such as `LogoWall`.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <LogoItem name="PepsiCo" />
 * <LogoItem name="Walmart" logo={<svg>...</svg>} />
 * ```
 */
export function LogoItem({
  name,
  logo,
  className,
  style,
  ...rest
}: LogoItemProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      aria-label={logo ? name : undefined}
      {...rest}
    >
      {logo ?? name}
    </div>
  );
}

LogoItem.displayName = 'LogoItem';

export default LogoItem;
