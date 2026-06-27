/**
 * FormField — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

/** Form field wrapper with label, error, and helper text. */
export function FormField({ label, required = false, error, helperText, children, className = '' }: FormFieldProps) {
  const id = React.useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[12px] font-semibold uppercase tracking-[0.04em] text-text-muted mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<{ id?: string; error?: string }>, { id, error }) : children}
      {error ? (
        <p className="text-[12px] text-danger mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-[12px] text-text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
