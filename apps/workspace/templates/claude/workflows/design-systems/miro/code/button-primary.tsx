import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label content. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// ButtonPrimary component
// ---------------------------------------------------------------------------

/**
 * `ButtonPrimary` — the dominant Miro CTA pill button.
 *
 * Black-ink fill with white-on-dark text, pill-shaped (9999px border radius),
 * and the standard button-md typography (14px/500/1.30). Used for the primary
 * call to action in marketing pages, pricing cards, and the hero section.
 *
 * Every visual property binds to a Miro design system CSS custom property via
 * semantic Tailwind classes — no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <ButtonPrimary>Get started free</ButtonPrimary>
 * ```
 */
export function ButtonPrimary({
  children,
  className = '',
  ...props
}: ButtonPrimaryProps) {
  return (
    <button
      className={`bg-ink text-on-dark rounded-pill px-6 py-3 text-sm font-medium leading-snug border-none cursor-pointer inline-flex items-center justify-center gap-2 no-underline ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

ButtonPrimary.displayName = 'ButtonPrimary';

export default ButtonPrimary;
