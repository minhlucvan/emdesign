import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardBaseProps {
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Card content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--miro-hairline-soft)',
  padding: 'var(--space-card)',
  boxSizing: 'border-box',
  width: '100%',
};

// ---------------------------------------------------------------------------
// CardBase component
// ---------------------------------------------------------------------------

/**
 * `CardBase` — foundational card container with hairline border and 16px corners.
 *
 * A standard card surface for the Miro design system: white background
 * (`--color-surface`), a soft hairline border (`--miro-hairline-soft`), and the
 * signature pricing-panel corner radius (`--radius-xl`: 16px). Use as the base
 * wrapper for stat tiles, content cards, pricing tiers, and any UI panel that
 * needs a contained card appearance with a subtle outline.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <CardBase>
 *   <h5>Standard Card</h5>
 *   <p>White canvas with hairline border and 16px corners...</p>
 *   <button className="btn-link">Read more →</button>
 * </CardBase>
 * ```
 */
export const CardBase: React.FC<CardBaseProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

CardBase.displayName = 'CardBase';

export default CardBase;
