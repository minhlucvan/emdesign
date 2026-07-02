import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The label text shown inside the pill. */
  label: string;
  /** Whether the pill is in an active/highlighted state (e.g. focused via
   *  keyboard navigation within an autocomplete dropdown). */
  active?: boolean;
  /** Called when the remove (x) button is clicked. When omitted, the remove
   *  button is not rendered, making the pill read-only. */
  onRemove?: () => void;
  /** Additional class names for custom styling. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Style constants -- every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-xxs) var(--space-xs)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-xxs)',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  userSelect: 'none',
  transition:
    'background-color var(--motion-fast) ease, color var(--motion-fast) ease',
};

const defaultStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
};

const activeStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-primary)',
  color: 'var(--miro-on-primary)',
};

const removeButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  color: 'inherit',
  opacity: 0.5,
  fontSize: 10,
  lineHeight: 1,
  width: 14,
  height: 14,
  borderRadius: '50%',
  flexShrink: 0,
  transition: 'opacity var(--motion-fast) ease',
};

// ---------------------------------------------------------------------------
// SearchPill component
// ---------------------------------------------------------------------------

/**
 * `SearchPill` -- compact removable chip for search / filter contexts in the
 * Miro design system.
 *
 * Renders a pill-shaped `<span>` element with `--radius-pill` rounding and
 * compact padding, designed for use inside search inputs, autocomplete
 * dropdowns, or active filter bars. The chip displays a label and optionally
 * a remove (x) button.
 *
 * The `active` state uses the solid black ink (`--miro-primary`) with white
 * text (`--miro-on-primary`), matching the `PillTab` active treatment for
 * visual consistency across pill-shaped controls.
 *
 * Every visual property binds to a Miro design system CSS custom property --
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <SearchPill label="Design" />
 * <SearchPill label="Engineering" active />
 * <SearchPill label="Marketing" onRemove={() => console.log('remove')} />
 * ```
 */
export function SearchPill({
  label,
  active = false,
  onRemove,
  className,
  style,
  ...rest
}: SearchPillProps) {
  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        ...(active ? activeStyle : defaultStyle),
        ...style,
      }}
      {...rest}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={removeButtonStyle}
          aria-label={`Remove ${label}`}
        >
          {'✕'}
        </button>
      )}
    </span>
  );
}

SearchPill.displayName = 'SearchPill';

export default SearchPill;
