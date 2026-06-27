/**
 * Switch — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Toggle switch with optional label. */
export function Switch({ checked = false, onChange, disabled = false, label, className = '' }: SwitchProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-45 pointer-events-none' : 'cursor-pointer'} ${className}`}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-[120ms] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ${
          checked ? 'bg-accent' : 'bg-border'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-[120ms] shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
      {label && <span className="text-[14px] text-text">{label}</span>}
    </label>
  );
}
