import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardBaseProps {
  /** Content rendered inside the card. */
  children?: React.ReactNode;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-xl)',
  border: '1px solid var(--color-border-soft)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  minWidth: 0,
};

// ---------------------------------------------------------------------------
// CardBase component
// ---------------------------------------------------------------------------

/**
 * Base card container for the Miro design system.
 *
 * Renders a white card with soft hairline border and 16px corner radius.
 * A flex-column layout with 12px gap that accepts any children — title,
 * description, actions, or composed sub-components.
 *
 * All visual properties bind to design-system CSS custom properties — no raw
 * values or hardcoded pixels.
 *
 * ```tsx
 * <CardBase>
 *   <h5>Standard Card</h5>
 *   <p>Content goes here.</p>
 * </CardBase>
 * ```
 */
export function CardBase({
  children,
  className,
  style,
  ...rest
}: CardBaseProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

CardBase.displayName = 'CardBase';

export default CardBase;
