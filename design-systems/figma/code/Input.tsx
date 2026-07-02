import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label rendered above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Text input with label, placeholder, and focus/error states.
 *
 * Follows the Figma `text-input` component token:
 * - White canvas background (`--color-canvas`)
 * - Ink text (`--color-ink`)
 * - Hairline border (`--color-hairline`)
 * - `--rounded-md` corners
 * - 12px vertical / 14px horizontal padding
 *
 * On focus the outline is set to `auto` to show the browser's focus ring;
 * Figma communicates focus via ring, not a fill change.
 *
 * On error the border switches to `--color-accent-magenta` and an error
 * message appears below. (Error styling is an extension beyond the
 * documented static-contact-form token, since no error states were visible
 * in the source screenshots.)
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  placeholder,
  style,
  ...rest
}) => {
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xxs)',
    fontFamily: 'var(--font-sans)',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-body-lg)',
    fontWeight: 'var(--font-weight-body-lg)',
    color: 'var(--color-ink)',
    lineHeight: 'var(--line-height-body-lg)',
    letterSpacing: 'var(--letter-spacing-body-lg)',
    fontFeatureSettings: '"kern"',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-accent-magenta)',
    lineHeight: '1.4',
    marginTop: 'var(--spacing-xxs)',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={wrapperStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        placeholder={placeholder}
        style={{
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-body)',
          lineHeight: 'var(--line-height-body)',
          letterSpacing: 'var(--letter-spacing-body)',
          padding: '12px 14px',
          borderRadius: 'var(--rounded-md)',
          border: error
            ? '1px solid var(--color-accent-magenta)'
            : '1px solid var(--color-hairline)',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          fontFeatureSettings: '"kern"',
          ...style,
        }}
        {...rest}
        onFocus={(e) => {
          // Apply focus ring via outline — Figma communicates focus by ring, not fill
          if (!error) {
            e.currentTarget.style.outline = '2px solid var(--color-primary)';
            e.currentTarget.style.outlineOffset = '2px';
          }
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
          rest.onBlur?.(e);
        }}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

Input.displayName = 'Input';
