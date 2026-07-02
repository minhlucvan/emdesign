import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PillTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this tab is in the active/selected state. */
  active?: boolean;
  /** Additional class names for custom styling. */
  className?: string;
  /** Tab label content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-xs) var(--space-md)',
  border: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xxs)',
  whiteSpace: 'nowrap',
  transition: 'background-color var(--motion-fast) ease, color var(--motion-fast) ease',
  userSelect: 'none',
};

const activeStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-primary)',
  color: 'var(--miro-on-primary)',
};

const inactiveStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
};

// ---------------------------------------------------------------------------
// PillTab component
// ---------------------------------------------------------------------------

/**
 * `PillTab` — pill-shaped tab button for the Miro design system.
 *
 * Renders a compact pill-shaped `<button>` element with Miro's signature
 * `--radius-pill` border radius. The active state uses the solid black ink
 * (`--miro-primary`) with white text (`--miro-on-primary`), while inactive
 * tabs appear as transparent pills with muted text and a hover-visible
 * background treatment.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <PillTab active>Active tab</PillTab>
 * <PillTab>Inactive tab</PillTab>
 * ```
 */
export const PillTab = React.forwardRef<HTMLButtonElement, PillTabProps>(
  ({ active = false, className, style, children, ...rest }, ref) => {
    const [hovered, setHovered] = React.useState(false);

    return (
      <button
        ref={ref}
        className={className}
        style={{
          ...baseStyle,
          ...(active ? activeStyle : inactiveStyle),
          ...(!active && hovered ? { backgroundColor: 'var(--color-surface)' } : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          rest.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          rest.onMouseLeave?.(e);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

PillTab.displayName = 'PillTab';

export default PillTab;
