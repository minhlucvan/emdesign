import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-raised border border-[var(--color-border)] rounded p-5 ${className}`}>
      {children}
    </div>
  );
}
