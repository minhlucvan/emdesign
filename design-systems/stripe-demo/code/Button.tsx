import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: '16px',
  borderRadius: '9999px',
  padding: '0 28px',
  height: '48px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '0',
  cursor: 'pointer',
  lineHeight: '1',
  boxSizing: 'border-box',
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    ...baseStyle,
    backgroundColor: '#533afd',
    color: '#ffffff',
  },
  secondary: {
    ...baseStyle,
    backgroundColor: '#f6f9fc',
    color: '#0d253d',
  },
  outline: {
    ...baseStyle,
    backgroundColor: '#ffffff',
    color: '#533afd',
    border: '2px solid #533afd',
  },
};

/** Stripe-style pill button matching reference-example.html. */
export function Button({ variant = 'primary', style, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={className}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}
