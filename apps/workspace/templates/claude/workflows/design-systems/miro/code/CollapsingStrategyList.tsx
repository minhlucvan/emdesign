import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollapsingStrategyItem {
  /** UI element or section name (e.g. "Top nav"). */
  element: string;
  /** Description of the collapsing behavior and at which breakpoints. */
  description: string;
}

export interface CollapsingStrategyListProps {
  /** Collapsing strategy specifications to display. */
  items: CollapsingStrategyItem[];
  /** Optional section heading rendered above the list. */
  title?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-heading-3)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  lineHeight: 1.25,
  margin: 0,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const itemStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  color: 'var(--color-text)',
  lineHeight: 1.7,
};

const bulletStyle: React.CSSProperties = {
  color: 'var(--color-text-tertiary)',
  marginRight: 'var(--space-xs)',
};

const elementStyle: React.CSSProperties = {
  fontWeight: 'var(--font-weight-medium)',
};

// ---------------------------------------------------------------------------
// CollapsingStrategyList component
// ---------------------------------------------------------------------------

/**
 * `CollapsingStrategyList` — a vertically-stacked specification list for
 * documenting responsive collapsing behavior in the Miro design system.
 *
 * Each item names a UI element or section and describes how it collapses
 * across breakpoints. Every visual property binds to a Miro design-system
 * CSS custom property — no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <CollapsingStrategyList
 *   title="Collapsing Strategy"
 *   items={[
 *     { element: "Promo banner", description: "stays full-width; truncates at < 480px." },
 *     { element: "Top nav", description: "below 1024px collapses to hamburger." },
 *     { element: "Pricing comparison", description: "4-column tiers → 2-column tablet → 1-column mobile." },
 *   ]}
 * />
 * ```
 */
export const CollapsingStrategyList = ({
  items,
  title,
  className,
  style,
  ...rest
}: CollapsingStrategyListProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
      {...rest}
    >
      {title && <h3 style={headingStyle}>{title}</h3>}
      <ul style={listStyle} role="list">
        {items.map((item, index) => (
          <li key={index} style={itemStyle}>
            <span style={bulletStyle} aria-hidden="true">-</span>
            <span style={elementStyle}>{item.element}</span>
            {' '}
            <span>{item.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

CollapsingStrategyList.displayName = 'CollapsingStrategyList';

export default CollapsingStrategyList;
