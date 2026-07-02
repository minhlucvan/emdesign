import React from 'react';

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label rendered above the input in figmaMono eyebrow style */
  label?: string;
  /** Error message displayed below the input; switches border to accent-magenta */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
}

/**
 * FormInput component following the Figma `text-input` component token.
 *
 * Design spec:
 * - White canvas background (`var(--color-canvas)`)
 * - Ink text (`var(--color-ink)`)
 * - Hairline border (`var(--color-hairline)`)
 * - `var(--rounded-md)` corners (8px)
 * - Body typography: 18px, weight 320, line-height 1.45, letter-spacing -0.26px
 * - Padding: 12px vertical / 14px horizontal
 *
 * Interactive states:
 * - **Default**: hairline border, white fill
 * - **Hover**: border darkens to ink (black) via a smooth transition
 * - **Focus**: black outline ring (2px solid var(--color-primary)) — focus is
 *   communicated via ring, not fill change
 * - **Disabled**: reduced opacity (0.4), not-allowed cursor
 * - **Error**: border switches to `var(--color-accent-magenta)` with error
 *   message rendered below (error styling is an extension beyond the
 *   documented static-contact-form token, since no error states were visible
 *   in the source screenshots)
 *
 * The visible label uses figmaMono eyebrow tokens (`var(--font-eyebrow)`)
 * matching the contact form label style on figma.com.
 *
 * Minimum tap target height: 48px (meets WCAG AAA touch target).
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      placeholder,
      disabled = false,
      readOnly = false,
      style,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);

    const wrapperStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-xxs)',
      width: '100%',
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-eyebrow)',
      fontWeight: 'var(--font-weight-eyebrow)',
      lineHeight: 'var(--line-height-eyebrow)',
      letterSpacing: 'var(--letter-spacing-eyebrow)',
      color: 'var(--color-ink)',
      textTransform: 'uppercase',
      fontFeatureSettings: '"kern"',
      userSelect: 'none',
    };

    const inputStyle: React.CSSProperties = {
      backgroundColor: 'var(--color-canvas)',
      color: disabled ? 'var(--color-ink)' : 'var(--color-ink)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--font-size-body)',
      fontWeight: 'var(--font-weight-body)',
      lineHeight: 'var(--line-height-body)',
      letterSpacing: 'var(--letter-spacing-body)',
      fontFeatureSettings: '"kern"',
      padding: '12px 14px',
      borderRadius: 'var(--rounded-md)',
      border: error
        ? '1px solid var(--color-accent-magenta)'
        : focused
          ? '1px solid var(--color-primary)'
          : hovered && !disabled
            ? '1px solid var(--color-ink)'
            : '1px solid var(--color-hairline)',
      outline: 'none',
      outlineOffset: '2px',
      boxShadow:
        focused && !error
          ? '0 0 0 2px var(--color-primary)'
          : 'none',
      width: '100%',
      boxSizing: 'border-box',
      cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
      opacity: disabled ? 0.4 : 1,
      transition:
        'border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
      minHeight: '48px',
      ...style,
    };

    const placeholderStyle = disabled
      ? { color: 'var(--color-hairline)' }
      : { color: 'var(--color-ink)', opacity: 0.5 };

    const errorStyle: React.CSSProperties = {
      fontSize: '14px',
      color: 'var(--color-accent-magenta)',
      lineHeight: '1.4',
      fontFamily: 'var(--font-sans)',
    };

    return (
      <div style={wrapperStyle}>
        {label && (
          <label htmlFor={rest.id} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={rest.id}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && rest.id ? `${rest.id}-error` : undefined}
          style={inputStyle}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onMouseEnter={(e) => {
            setHovered(true);
            onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            setHovered(false);
            onMouseLeave?.(e);
          }}
        />
        {error && (
          <span
            id={rest.id ? `${rest.id}-error` : undefined}
            role="alert"
            style={errorStyle}
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';
