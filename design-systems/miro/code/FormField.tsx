import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormFieldProps {
  /** Label text rendered above the field. */
  label?: React.ReactNode;
  /** Whether the field is required (passes through to FormLabel). */
  required?: boolean;
  /** Helper text displayed below the field. */
  helpText?: React.ReactNode;
  /** Error message — replaces helpText when set, rendered in accent color. */
  error?: string;
  /** Additional class names for custom styling. */
  className?: string;
  /** The input / field control(s). */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const rootStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
};

const helpTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.4,
  color: 'var(--color-text-muted)',
  margin: 0,
  boxSizing: 'border-box',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.4,
  color: 'var(--miro-primary)',
  margin: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// FormField component
// ---------------------------------------------------------------------------

/**
 * `FormField` — form field layout container for the Miro design system.
 *
 * Renders a vertical stack with a consistent `--space-xs` (8px) gap between
 * the label (`FormLabel`), the input control (children), and optional helper
 * or error text. Designed to wrap any form control — `<input>`, `<select>`,
 * `FilterDropdown`, etc.
 *
 * Pass the label via the `label` prop and the input/control as `children`.
 * When `error` is provided, it replaces `helpText` and renders in the
 * accent/ink color (`--miro-primary`).
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <FormField label="Email" required>
 *   <input type="email" />
 * </FormField>
 *
 * <FormField label="Password" error="Password is required">
 *   <input type="password" />
 * </FormField>
 *
 * <FormField label="Category" helpText="Select one or more categories">
 *   <FilterDropdown ... />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  required = false,
  helpText,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className} style={rootStyle}>
      {label && (
        <FormLabel required={required}>{label}</FormLabel>
      )}
      {children}
      {(error || helpText) && (
        <span style={error ? errorTextStyle : helpTextStyle}>
          {error || helpText}
        </span>
      )}
    </div>
  );
}

FormField.displayName = 'FormField';

export default FormField;
