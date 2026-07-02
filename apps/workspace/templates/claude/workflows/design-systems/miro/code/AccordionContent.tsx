import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccordionContentProps {
  /** Content rendered inside the accordion panel. */
  children?: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Whether the accordion panel is expanded (visible). */
  isOpen?: boolean;
  /** ID for the content region — referenced by the trigger's aria-controls. */
  id?: string;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-md)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  paddingTop: 'var(--space-sm)',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// AccordionContent component
// ---------------------------------------------------------------------------

/**
 * `AccordionContent` — content panel for the Miro design system's accordion
 * component.
 *
 * Renders a vertically-stacked content region that is revealed or hidden based
 * on the `isOpen` prop. Sized with the body-md type scale (16px / 400 / 1.50)
 * and the muted text color — matching the Miro FAQ answer pattern found in the
 * design reference.
 *
 * When `isOpen` is `false` the panel is removed from the accessibility tree and
 * hidden (equivalent to `display: none`). When `isOpen` is `true` the panel is
 * rendered as a flex-column container with the design system's body spacing.
 *
 * All colors, typography, and spacing bind to design-system CSS custom
 * properties — no raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <AccordionContent id="faq-1-panel" isOpen={expanded}>
 *   Miro offers a Free tier for individuals, Starter at $8/month…
 * </AccordionContent>
 * ```
 */
export const AccordionContent = ({
  children,
  className,
  style,
  isOpen = false,
  id,
  ...rest
}: AccordionContentProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      id={id}
      className={className}
      role="region"
      hidden={!isOpen}
      style={{
        ...panelStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

AccordionContent.displayName = 'AccordionContent';

export default AccordionContent;
