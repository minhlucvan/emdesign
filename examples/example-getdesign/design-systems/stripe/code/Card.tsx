import React, { useState, forwardRef } from 'react';

export type CardVariant = 'default' | 'elevated' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

/* ---- Static style maps ---- */

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-xxl)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  boxSizing: 'border-box',
};

const variantStyle: Record<CardVariant, React.CSSProperties> = {
  default: {
    border: '1px solid var(--color-border)',
    boxShadow: 'none',
  },
  elevated: {
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-raised)',
  },
  interactive: {
    border: '1px solid var(--color-border)',
    boxShadow: 'none',
    cursor: 'pointer',
  },
};

const interactiveHover: React.CSSProperties = {
  boxShadow: 'var(--shadow-level-1)',
  transform: 'translateY(-2px)',
};

/* ---- Component ---- */

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', style, children, onMouseEnter, onMouseLeave, ...props },
    ref,
  ) => {
    const [hovered, setHovered] = useState(false);
    const isInteractive = variant === 'interactive';

    return (
      <div
        ref={ref}
        style={{
          ...baseStyle,
          ...variantStyle[variant],
          ...(isInteractive && hovered ? interactiveHover : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
