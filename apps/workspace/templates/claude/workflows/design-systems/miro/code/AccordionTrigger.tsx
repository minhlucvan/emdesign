import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccordionTriggerProps {
  /** Content displayed as the accordion header label. */
  children?: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Whether the accordion panel is currently expanded. */
  isOpen?: boolean;
  /** Called when the trigger is clicked. */
  onClick?: () => void;
  /** ID that matches the panel's `id` for `aria-controls`. */
  ['aria-controls']?: string;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const triggerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  width: '100%',
  padding: 'var(--space-xl)',
  background: 'var(--color-surface-raised)',
  border: 'none',
  borderBottom: '1px solid var(--color-border)',
  borderRadius: 0,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.4,
  color: 'var(--color-text)',
  cursor: 'pointer',
  boxSizing: 'border-box',
  textAlign: 'left',
  userSelect: 'none',
};

const chevronStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  color: 'var(--color-text-muted)',
  flexShrink: 0,
  transition: 'transform 200ms ease',
};

// ---------------------------------------------------------------------------
// AccordionTrigger component
// ---------------------------------------------------------------------------

/**
 * `AccordionTrigger` — clickable header for the Miro design system's accordion
 * component.
 *
 * Renders a full-width button that reveals or hides a paired `AccordionContent`
 * panel on click. The button displays the provided children (typically question
 * or section text) on the left and a chevron indicator on the right. When
 * `isOpen` is `true` the chevron rotates 180° to point upward.
 *
 * Provides proper ARIA attributes (`aria-expanded`, `aria-controls`) for
 * accessible accordion behavior. All colors, spacing, and typography bind to
 * design-system CSS custom properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <AccordionTrigger
 *   isOpen={expanded}
 *   onClick={() => setExpanded(!expanded)}
 *   aria-controls="faq-1-panel"
 * >
 *   How does Miro pricing work?
 * </AccordionTrigger>
 * ```
 */
export const AccordionTrigger = ({
  children,
  className,
  style,
  isOpen = false,
  onClick,
  'aria-controls': ariaControls,
  ...rest
}: AccordionTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={className}
      style={{
        ...triggerStyle,
        ...style,
      }}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls={ariaControls}
      type="button"
      {...rest}
    >
      <span>{children}</span>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        style={{
          ...chevronStyle,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';

export default AccordionTrigger;
