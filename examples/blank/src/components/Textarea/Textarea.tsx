/**
 * Textarea — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface TextareaProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

/** Multi-line text input with optional label, error, and character count. */
export function Textarea({ label, value, onChange, placeholder, error, disabled = false, rows = 4, maxLength, className = '' }: TextareaProps) {
  return (
    <div className={className}>
      {label && <label className="block text-[12px] font-semibold uppercase tracking-[0.04em] text-text-muted mb-1.5">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full rounded text-sm bg-surface-raised border text-text placeholder:text-text-muted px-3 py-2 focus:outline-none focus:border-accent focus:shadow-[var(--focus-ring)] transition-[border-color,box-shadow] duration-[120ms] resize-vertical ${
          error ? 'border-danger' : 'border-border'
        } ${disabled ? 'opacity-45 pointer-events-none' : ''}`}
      />
      <div className="flex justify-between mt-1">
        {error ? <p className="text-[12px] text-danger">{error}</p> : <span />}
        {maxLength && <span className="text-[11px] text-text-muted">{(value ?? '').length}/{maxLength}</span>}
      </div>
    </div>
  );
}
