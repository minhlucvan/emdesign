import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToggleOption {
  /** Unique value identifying this option. */
  value: string;
  /** Label content rendered inside the toggle button. */
  label: React.ReactNode;
}

export interface TogglePillProps {
  /** Array of toggle options to render as pill-shaped segments. */
  options: ToggleOption[];
  /** Currently selected value (controlled component). */
  value: string;
  /** Called when a new option is selected. */
  onChange?: (value: string) => void;
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Accessible label for the toggle group (e.g. "Billing period"). */
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro design system CSS custom property
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-xxs)',
  padding: 'var(--space-xxs)',
  background: 'var(--color-surface)',
  borderRadius: '9999px',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const buttonBaseStyle: React.CSSProperties = {
  padding: 'var(--space-xs) var(--space-md)',
  background: 'transparent',
  border: 'none',
  borderRadius: '9999px',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.3,
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 150ms ease, color 150ms ease, box-shadow 150ms ease',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  boxSizing: 'border-box',
};

const buttonActiveStyle: React.CSSProperties = {
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text)',
  boxShadow: '0 1px 2px rgba(5,0,56,0.04)',
};

// ---------------------------------------------------------------------------
// TogglePill component
// ---------------------------------------------------------------------------

/**
 * Pill-shaped segmented toggle for the Miro design system.
 *
 * Renders a horizontally-aligned group of pill-shaped buttons where exactly one
 * option is selected at any time (radio-group pattern). Typically used for
 * switching between mutually exclusive modes or views — e.g. Monthly / Annual
 * billing toggles, or view-mode switches.
 *
 * The container sits on the design system's surface background (`--color-surface`)
 * while the active segment lifts onto the raised surface (`--color-surface-raised`)
 * with a subtle shadow — matching the Miro toggle-pill pattern seen in pricing
 * and filter controls.
 *
 * All colors, spacing, and typography bind to design-system CSS custom properties.
 * No raw hex values or hardcoded spacing are used.
 *
 * ```tsx
 * <TogglePill
 *   options={[
 *     { value: 'monthly', label: 'Monthly' },
 *     { value: 'annual', label: 'Annual' },
 *   ]}
 *   value={billingPeriod}
 *   onChange={setBillingPeriod}
 *   aria-label="Billing period"
 * />
 * ```
 */
export const TogglePill = ({
  options,
  value,
  onChange,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: TogglePillProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
      role="radiogroup"
      aria-label={ariaLabel}
      {...rest}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            style={{
              ...buttonBaseStyle,
              ...(isActive ? buttonActiveStyle : {}),
            }}
            onClick={() => onChange?.(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

TogglePill.displayName = 'TogglePill';

export default TogglePill;
