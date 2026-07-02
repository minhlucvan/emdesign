import React, { useState, forwardRef } from 'react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
}

/* ---- Static style maps ---- */

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 'var(--font-weight-body-md)',
  lineHeight: 'var(--line-height-body-md)',
  letterSpacing: 'var(--letter-spacing-body-md)',
  color: 'var(--color-text)',
};

const inputBase: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 'var(--font-weight-body-md)',
  lineHeight: 'var(--line-height-body-md)',
  letterSpacing: 'var(--letter-spacing-body-md)',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-sm) var(--space-md)',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  width: '100%',
  boxSizing: 'border-box',
  minHeight: '40px',
};

const inputFocus: React.CSSProperties = {
  borderColor: 'var(--color-accent)',
  boxShadow: '0 0 0 1px var(--color-accent)',
};

const inputError: React.CSSProperties = {
  borderColor: 'var(--color-ruby)',
  boxShadow: '0 0 0 1px var(--color-ruby)',
};

const errorMessageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-caption)',
  fontWeight: 'var(--font-weight-caption)',
  lineHeight: 'var(--line-height-caption)',
  letterSpacing: 'var(--letter-spacing-caption)',
  color: 'var(--color-ruby)',
  margin: 0,
};

/* ---- Component ---- */

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasError = !!error;

    return (
      <div style={wrapperStyle}>
        {label && <label style={labelStyle}>{label}</label>}

        <input
          ref={ref}
          style={{
            ...inputBase,
            ...(focused && !hasError ? inputFocus : {}),
            ...(hasError ? inputError : {}),
            ...style,
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {error && <p style={errorMessageStyle}>{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
