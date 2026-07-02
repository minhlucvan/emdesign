import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FooterShellProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Footer content — typically a column grid, credit bar, etc. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-footer-bg)',
  color: 'var(--color-text-on-dark)',
  fontFamily: 'var(--font-sans)',
  padding: 'var(--space-section) var(--space-xxl)',
  boxSizing: 'border-box',
  width: '100%',
};

// ---------------------------------------------------------------------------
// FooterShell component
// ---------------------------------------------------------------------------

/**
 * `FooterShell` — dark multi-column footer container for the Miro design system.
 *
 * Renders a full-width `<footer>` element with the signature Miro dark ink
 * background (`--color-footer-bg`) and on-dark typography, padded per the
 * `footer-region` contract (`--space-section` vertical, `--space-xxl`
 * horizontal). Designed to wrap inner layout components such as footer grids,
 * column groups, link lists, and credit bars.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <FooterShell>
 *   <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
 *     <FooterGrid>
 *       <FooterColumn heading="Product" links={[...]} />
 *       <FooterColumn heading="Solutions" links={[...]} />
 *     </FooterGrid>
 *     <FooterCredit>...</FooterCredit>
 *   </div>
 * </FooterShell>
 * ```
 */
export const FooterShell: React.FC<FooterShellProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <footer
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </footer>
  );
};

FooterShell.displayName = 'FooterShell';

export default FooterShell;
