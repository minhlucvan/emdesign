import React from 'react';
import { DiscountBadge } from './DiscountBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TogglePillOption = 'monthly' | 'annual';

export interface TogglePillProps {
  /** Currently selected option. */
  value: TogglePillOption;
  /** Called when the user selects an option. */
  onChange: (value: TogglePillOption) => void;
  /** Label text for the discount badge shown on the Annual option. When omitted, no badge is rendered. */
  discountLabel?: string;
  /** Additional class names for custom styling. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Style constants -- every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 'var(--radius-pill)',
  backgroundColor: 'var(--color-surface)',
  padding: 'var(--space-xxs)',
  gap: 0,
  boxSizing: 'border-box',
};

const optionBaseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-xs) var(--space-md)',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xxs)',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  transition:
    'background-color var(--motion-fast) ease, color var(--motion-fast) ease',
};

const activeOptionStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-primary)',
  color: 'var(--miro-on-primary)',
};

const inactiveOptionStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
};

// ---------------------------------------------------------------------------
// TogglePill component
// ---------------------------------------------------------------------------

/**
 * `TogglePill` — segmented pill toggle for binary choices in the Miro design
 * system.
 *
 * Renders a pill-shaped segmented control with two options (e.g. Monthly /
 * Annual). The active option uses the signature Miro solid black ink
 * (`--miro-primary`) with white text (`--miro-on-primary`), matching the
 * active state of other pill-shaped controls like `PillTab` and `SearchPill`.
 *
 * When `discountLabel` is provided, a `DiscountBadge` is rendered inside the
 * Annual option, consistent with Miro's promotional visual language.
 *
 * Every visual property binds to a Miro design system CSS custom property --
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <TogglePill value="monthly" onChange={(v) => setPlan(v)} />
 * <TogglePill value="annual" onChange={(v) => setPlan(v)} discountLabel="Save 20%" />
 * ```
 */
export function TogglePill({
  value,
  onChange,
  discountLabel,
  className,
  style,
  ...rest
}: TogglePillProps & { style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
      role="radiogroup"
      {...rest}
    >
      {/* Monthly option */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'monthly'}
        style={{
          ...optionBaseStyle,
          ...(value === 'monthly' ? activeOptionStyle : inactiveOptionStyle),
        }}
        onClick={() => onChange('monthly')}
      >
        Monthly
      </button>

      {/* Annual option */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'annual'}
        style={{
          ...optionBaseStyle,
          ...(value === 'annual' ? activeOptionStyle : inactiveOptionStyle),
        }}
        onClick={() => onChange('annual')}
      >
        Annual
        {discountLabel && <DiscountBadge variant="promo">{discountLabel}</DiscountBadge>}
      </button>
    </div>
  );
}

TogglePill.displayName = 'TogglePill';

export default TogglePill;
