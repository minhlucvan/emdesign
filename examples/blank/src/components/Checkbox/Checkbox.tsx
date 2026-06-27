/**
 * Checkbox — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Checkbox with optional label. Supports indeterminate state. */
export function Checkbox({ checked = false, indeterminate = false, onChange, disabled = false, label, className = '' }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-45 pointer-events-none' : 'cursor-pointer'} ${className}`}>
      <button
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors duration-[120ms] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ${
          checked || indeterminate ? 'bg-accent border-accent text-white' : 'bg-surface-raised border-border'
        }`}
      >
        {indeterminate ? (
          <span className="block w-2 h-0.5 bg-white rounded" />
        ) : checked ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </button>
      {label && <span className="text-[14px] text-text">{label}</span>}
    </label>
  );
}
