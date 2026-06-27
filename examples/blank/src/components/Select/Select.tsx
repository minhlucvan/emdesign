/**
 * Select — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface SelectOption { value: string; label: string; }

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

/** Select dropdown. */
export function Select({ options, value, onChange, placeholder = 'Select...', disabled = false, error, className = '' }: SelectProps) {
  return (
    <div className={className}>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full h-8 px-3 rounded text-sm bg-surface-raised border text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[var(--focus-ring)] transition-[border-color,box-shadow] duration-[120ms] appearance-none cursor-pointer ${
          error ? 'border-danger' : 'border-border'
        } ${disabled ? 'opacity-45 pointer-events-none' : ''}`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
    </div>
  );
}
