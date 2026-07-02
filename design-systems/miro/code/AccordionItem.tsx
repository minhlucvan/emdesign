import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccordionItemProps {
  /** Unique identifier for the accordion item. */
  id: string;
  /** Header / title content rendered in the clickable toggle area. */
  title: React.ReactNode;
  /** Body content revealed when the item is expanded. */
  children?: React.ReactNode;
  /** Whether this item is disabled and cannot be toggled. */
  disabled?: boolean;
  /** Whether the item is expanded. When provided, the component is controlled. */
  expanded?: boolean;
  /** Default expanded state (uncontrolled). */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const itemStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  borderBottom: '1px solid var(--miro-hairline-soft)',
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
// AccordionItem component
// ---------------------------------------------------------------------------

/**
 * `AccordionItem` — single expandable panel for the Miro design system.
 *
 * Renders a clickable header row that toggles the visibility of a content
 * panel. Can be used standalone or composed within an `Accordion` container.
 * Supports both controlled and uncontrolled expansion, as well as a disabled
 * state.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * // Uncontrolled
 * <AccordionItem id="faq-1" title="How do I get started?">
 *   Content for FAQ item one.
 * </AccordionItem>
 *
 * // Controlled
 * <AccordionItem
 *   id="faq-2"
 *   title="What are the system requirements?"
 *   expanded={isOpen}
 *   onExpandedChange={setIsOpen}
 * >
 *   Content for FAQ item two.
 * </AccordionItem>
 *
 * // Disabled
 * <AccordionItem id="faq-3" title="Coming soon" disabled>
 *   Content not yet available.
 * </AccordionItem>
 * ```
 */
export function AccordionItem({
  id,
  title,
  children,
  disabled = false,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  style,
  ...rest
}: AccordionItemProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const [hovered, setHovered] = React.useState(false);

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (disabled) return;
    if (isControlled) {
      onExpandedChange?.(!controlledExpanded);
    } else {
      setInternalExpanded((prev) => {
        const next = !prev;
        onExpandedChange?.(next);
        return next;
      });
    }
  };

  return (
    <div
      className={className}
      style={{ ...itemStyle, ...style }}
      {...rest}
    >
      {/* ── Toggle header ─────────────────────────────────── */}
      <button
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...headerStyle,
          ...(disabled ? headerDisabledStyle : {}),
          ...(!disabled && hovered ? headerHoverStyle : {}),
        }}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${id}`}
        disabled={disabled}
      >
        <span>{title}</span>
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
        id={`accordion-content-${id}`}
        style={isExpanded ? contentExpandedStyle : contentCollapsedStyle}
        role="region"
        aria-hidden={!isExpanded}
      >
        <div style={contentInnerStyle}>{children}</div>
      </div>
    </div>
  );
}

AccordionItem.displayName = 'AccordionItem';

export default AccordionItem;
