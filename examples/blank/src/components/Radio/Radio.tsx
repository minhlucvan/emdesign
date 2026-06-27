/**
 * Radio — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

interface RadioOption { value: string; label: string; }

export interface RadioProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  direction?: 'row' | 'col';
  className?: string;
}

/** Radio group. */
export function Radio({ options, value, onChange, disabled = false, direction = 'col', className = '' }: RadioProps) {
  return (
    <div className={`flex ${direction === 'col' ? 'flex-col gap-2' : 'flex-row gap-4'} ${className}`}>
      {options.map((opt) => (
        <label key={opt.value} className={`inline-flex items-center gap-2 ${disabled ? 'opacity-45 pointer-events-none' : 'cursor-pointer'}`}>
          <button
            role="radio"
            aria-checked={value === opt.value}
            disabled={disabled}
            onClick={() => onChange?.(opt.value)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-[120ms] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ${
              value === opt.value ? 'border-accent' : 'border-border'
            }`}
          >
            {value === opt.value && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
          <span className="text-[14px] text-text">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
