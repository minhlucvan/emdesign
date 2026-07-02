import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Additional class names for custom styling. */
  className?: string;
  /** Label content. */
  children?: React.ReactNode;
  /** Whether the field is required (renders an asterisk). */
  required?: boolean;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  margin: 0,
  boxSizing: 'border-box',
  display: 'block',
};

// ---------------------------------------------------------------------------
// FormLabel component
// ---------------------------------------------------------------------------

/**
 * `FormLabel` — styled `<label>` element for the Miro design system.
 *
 * Renders a block-level `<label>` in Miro's 14px/500 body-sm typography and
 * ink color (`--color-text`). Designed for use as a stacked label above its
 * associated input — place inside a flex column container with `--space-xs`
 * (8px) gap between the label and the input element.
 *
 * Supports an optional `required` prop that appends an accent-colored
 * asterisk.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <FormLabel>Email</FormLabel>
 * <FormLabel required>Full name</FormLabel>
 * ```
 */
export function FormLabel({
  className,
  style,
  children,
  required = false,
  ...rest
}: FormLabelProps) {
  return (
    <label
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
      {required && (
        <span
          style={{
            color: 'var(--color-accent)',
            marginLeft: 'var(--space-xxs)',
          }}
        >
          *
        </span>
      )}
    </label>
  );
}

FormLabel.displayName = 'FormLabel';

export default FormLabel;
