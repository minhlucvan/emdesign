import React from 'react';

type CardVariant = 'pricing-light' | 'pricing-featured' | 'feature-alt';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const baseStyle: React.CSSProperties = {
  padding: '32px',
  borderRadius: '12px',
  minWidth: 0,
  boxSizing: 'border-box',
};

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  'pricing-light': {
    ...baseStyle,
    background: '#ffffff',
    border: '1px solid #e3e8ee',
    color: '#0d253d',
  },
  'pricing-featured': {
    ...baseStyle,
    background: '#1c1e54',
    color: '#ffffff',
  },
  'feature-alt': {
    ...baseStyle,
    background: '#f6f9fc',
    color: '#0d253d',
  },
};

/** Stripe-style card matching reference-example.html card variants. */
export function Card({ variant = 'pricing-light', style, className = '', ...props }: CardProps) {
  return (
    <div
      className={className}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}
