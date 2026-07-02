import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccordionItem {
  /** Unique identifier for the accordion item. */
  id: string;
  /** Header / title content rendered in the clickable toggle area. */
  title: React.ReactNode;
  /** Body content revealed when the item is expanded. */
  content: React.ReactNode;
  /** Whether this item is disabled and cannot be toggled. */
  disabled?: boolean;
}

export interface AccordionProps {
  /** Array of accordion items to render. */
  items: AccordionItem[];
  /**
   * Whether multiple items can be expanded simultaneously.
   * Defaults to `false` (classic accordion — one open at a time).
   */
  allowMultiple?: boolean;
  /** Controlled set of expanded item IDs. When provided, the component is controlled. */
  expandedIds?: string[];
  /** Called when the expanded set changes. */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const accordionStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--miro-hairline-soft)',
  overflow: 'hidden',
};

const itemStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  borderBottom: '1px solid var(--miro-hairline-soft)',
};

const lastItemStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  borderBottom: 'none',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-sm)',
  width: '100%',
  padding: 'var(--space-md) var(--space-sm)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
  textAlign: 'left',
  userSelect: 'none',
  transition: 'background-color var(--motion-fast) ease',
};

const headerHoverStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
};

const headerDisabledStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
};

const chevronStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-muted)',
  fontSize: 10,
  lineHeight: 1,
  transition: 'transform var(--motion-fast) ease',
  flexShrink: 0,
};

const chevronOpenStyle: React.CSSProperties = {
  transform: 'rotate(180deg)',
};

const contentOuterStyle: React.CSSProperties = {
  overflow: 'hidden',
  transition: 'max-height var(--motion-fast) ease, opacity var(--motion-fast) ease',
  boxSizing: 'border-box',
};

const contentCollapsedStyle: React.CSSProperties = {
  ...contentOuterStyle,
  maxHeight: 0,
  opacity: 0,
};

const contentExpandedStyle: React.CSSProperties = {
  ...contentOuterStyle,
  maxHeight: 1000,
  opacity: 1,
};

const contentInnerStyle: React.CSSProperties = {
  padding: '0 var(--space-sm) var(--space-md)',
  fontSize: 14,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.6,
  color: 'var(--color-text)',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Accordion component
// ---------------------------------------------------------------------------

/**
 * `Accordion` — vertically stacked set of expandable panels for the Miro
 * design system.
 *
 * Renders a bordered container with clickable header rows that toggle the
 * visibility of their associated content panels. Supports both single
 * (classic accordion) and multiple simultaneous expansion modes. The
 * component can be used in controlled or uncontrolled state.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * // Uncontrolled, single-expand (classic accordion)
 * <Accordion
 *   items={[
 *     { id: '1', title: 'Section 1', content: 'Content for section 1' },
 *     { id: '2', title: 'Section 2', content: 'Content for section 2' },
 *   ]}
 * />
 *
 * // Controlled, multi-expand
 * <Accordion
 *   allowMultiple
 *   expandedIds={['1', '3']}
 *   onExpandedChange={(ids) => console.log(ids)}
 *   items={[
 *     { id: '1', title: 'Getting Started', content: <GettingStartedGuide /> },
 *     { id: '2', title: 'Integrations', content: <IntegrationsList /> },
 *     { id: '3', title: 'Templates', disabled: true, content: 'Coming soon' },
 *   ]}
 * />
 * ```
 */
export function Accordion({
  items,
  allowMultiple = false,
  expandedIds: controlledExpandedIds,
  onExpandedChange,
  className,
  style,
  ...rest
}: AccordionProps) {
  const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>([]);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const isControlled = controlledExpandedIds !== undefined;
  const expandedIds = isControlled ? controlledExpandedIds : internalExpandedIds;

  const handleToggle = (id: string) => {
    if (isControlled) {
      const next = allowMultiple
        ? expandedIds.includes(id)
          ? expandedIds.filter((eid) => eid !== id)
          : [...expandedIds, id]
        : expandedIds.includes(id)
          ? []
          : [id];
      onExpandedChange?.(next);
    } else {
      setInternalExpandedIds((prev) =>
        allowMultiple
          ? prev.includes(id)
            ? prev.filter((eid) => eid !== id)
            : [...prev, id]
          : prev.includes(id)
            ? []
            : [id],
      );
    }
  };

  return (
    <div
      className={className}
      style={{
        ...accordionStyle,
        ...style,
      }}
      {...rest}
    >
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} style={isLast ? lastItemStyle : itemStyle}>
            {/* ── Toggle header ─────────────────────────────────── */}
            <button
              type="button"
              onClick={() => {
                if (!item.disabled) handleToggle(item.id);
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...headerStyle,
                ...(item.disabled ? headerDisabledStyle : {}),
                ...(!item.disabled && hoveredId === item.id ? headerHoverStyle : {}),
              }}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.id}`}
              disabled={item.disabled}
            >
              <span>{item.title}</span>
              <span
                style={{
                  ...chevronStyle,
                  ...(isExpanded ? chevronOpenStyle : {}),
                }}
                aria-hidden
              >
                ▼
              </span>
            </button>

            {/* ── Collapsible content panel ─────────────────────── */}
            <div
              id={`accordion-content-${item.id}`}
              style={isExpanded ? contentExpandedStyle : contentCollapsedStyle}
              role="region"
              aria-hidden={!isExpanded}
            >
              <div style={contentInnerStyle}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Accordion.displayName = 'Accordion';

export default Accordion;
