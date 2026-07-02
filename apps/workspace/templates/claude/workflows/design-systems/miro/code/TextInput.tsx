import React, { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextInputProps {
  /** Label text rendered above the input field. */
  label?: string;
  /** Placeholder text displayed when the input is empty. */
  placeholder?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled default value. */
  defaultValue?: string;
  /** Change handler. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** HTML input type (default "text"). */
  type?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Disabled state — grayed out and non-interactive. */
  disabled?: boolean;
  /** Input name attribute. */
  name?: string;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xxs)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  margin: 0,
};

const inputBaseStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: 'var(--font-size-body-md)',
  fontFamily: 'inherit',
  lineHeight: 1.5,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
};

const inputFocusStyle: React.CSSProperties = {
  border: '2px solid var(--color-accent)',
  padding: 'calc(var(--space-sm) - 1px) calc(var(--space-md) - 1px)',
};

const inputDisabledStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

// ---------------------------------------------------------------------------
// TextInput component
// ---------------------------------------------------------------------------

/**
 * `TextInput` — text input primitive for the Miro design system.
 *
 * Renders a vertically-stacked label and text input field matching the Miro
 * input visual style: white raised surface background, hairline border that
 * transitions to a 2px accent border on focus, 8px rounded corners
 * (`--radius`), and the body-md (16px / 400 / 1.50) type scale.
 *
 * All colors, spacing, and typography bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <TextInput label="Email" placeholder="you@email.com" />
 * <TextInput label="Workspace name" defaultValue="My Workspace" />
 * ```
 */
export const TextInput = ({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  type = 'text',
  className,
  style,
  disabled = false,
  name,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const resolvedInputStyle: React.CSSProperties = {
    ...inputBaseStyle,
    ...(focused ? inputFocusStyle : {}),
    ...(disabled ? inputDisabledStyle : {}),
  };

  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
    >
      {label && <label style={labelStyle}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        name={name}
        style={resolvedInputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-disabled={disabled || undefined}
        {...rest}
      />
    </div>
  );
};

TextInput.displayName = 'TextInput';

export default TextInput;
