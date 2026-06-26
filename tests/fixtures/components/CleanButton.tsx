/**
 * A lint-clean button component for test fixtures.
 * References only token roles — no raw hex, no hardcoded values.
 */
import React from 'react';

interface CleanButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function CleanButton({ label, variant = 'primary', onClick }: CleanButtonProps) {
  const baseClass = 'px-4 py-2 rounded-md font-body text-sm transition-colors duration-fast';
  const variantClass = variant === 'primary'
    ? 'bg-accent text-surface hover:opacity-90'
    : 'bg-surface text-accent border border-border hover:bg-muted/10';

  return (
    <button className={`${baseClass} ${variantClass}`} onClick={onClick}>
      {label}
    </button>
  );
}
