import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: 'white',
    border: 'none',
  },
};

/** Atelier primary/secondary button. Matches reference: 40px height, 14px font-size, 8px radius,
 *  12px/20px padding, sans-serif. */
export function Button({ variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md, 8px)',
        fontWeight: 500,
        padding: '12px 20px',
        height: '40px',
        fontSize: '14px',
        lineHeight: 1,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    />
  );
}
