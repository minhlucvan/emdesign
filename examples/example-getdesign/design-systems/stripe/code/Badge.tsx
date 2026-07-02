import React from 'react';

export type BadgeVariant = 'accent' | 'success' | 'warn' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/* ---- Static style maps ---- */

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-micro-cap)',
  fontWeight: 'var(--font-weight-micro-cap)',
  lineHeight: 'var(--line-height-micro-cap)',
  letterSpacing: 'var(--letter-spacing-micro-cap)',
  borderRadius: 'var(--radius-pill)',
  padding: '2px var(--space-sm)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  textTransform: 'uppercase',
};

const variantStyle: Record<BadgeVariant, React.CSSProperties> = {
  accent: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-primary)',
  },
  success: {
    backgroundColor: 'var(--color-primary-bg-subdued-hover)',
    color: 'var(--color-primary-deep)',
  },
  warn: {
    backgroundColor: 'var(--color-canvas-cream)',
    color: 'var(--color-lemon)',
  },
  danger: {
    backgroundColor: 'var(--color-ruby)',
    color: 'var(--color-on-primary)',
  },
};

/* ---- Component ---- */

const Badge: React.FC<BadgeProps> = ({
  variant = 'accent',
  style,
  children,
  ...props
}) => {
  return (
    <span
      style={{
        ...baseStyle,
        ...variantStyle[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
