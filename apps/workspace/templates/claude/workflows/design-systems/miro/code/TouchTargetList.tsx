import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TouchTargetItem {
  /** UI element name (e.g. "Pill buttons"). */
  element: string;
  /** Descriptive text including the metric (e.g. "render at 40-44px height"). */
  description: string;
  /** Optional contextual note (e.g. "WCAG AAA floor"). */
  note?: string;
}

export interface TouchTargetListProps {
  /** Touch-target specification items to display. */
  items: TouchTargetItem[];
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

const noteStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-micro)',
  color: 'var(--color-text-tertiary)',
};

// ---------------------------------------------------------------------------
// TouchTargetList component
// ---------------------------------------------------------------------------

/**
 * `TouchTargetList` — a vertically-stacked specification list for documenting
 * interactive-element touch-target minimums in the Miro design system.
 *
 * Each item names a UI element and describes its touch-target metric, with an
 * optional contextual note. Every visual property binds to a Miro design-system
 * CSS custom property — no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <TouchTargetList
 *   title="Touch Targets"
 *   items={[
 *     { element: "Pill buttons", description: "render at 40-44px height", note: "WCAG AAA floor" },
 *     { element: "Form inputs", description: "render at 44px height" },
 *   ]}
 * />
 * ```
 */
export const TouchTargetList = ({
  items,
  title,
  className,
  style,
  ...rest
}: TouchTargetListProps & React.HTMLAttributes<HTMLDivElement>) => {
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
            {item.note && (
              <>
                {' — '}
                <span style={noteStyle}>{item.note}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

TouchTargetList.displayName = 'TouchTargetList';

export default TouchTargetList;
