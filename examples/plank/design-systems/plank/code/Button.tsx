import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded px-3 py-2 text-sm font-semibold transition-colors duration-200';
  const styles = variant === 'primary'
    ? 'bg-accent text-white hover:bg-[var(--color-accent-hover)]'
    : 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-border)]';
  return (
    <button className={`${base} ${styles}`} onClick={onClick}>
      {children}
    </button>
  );
}
