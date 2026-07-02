import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromoBannerProps {
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Banner content — text nodes alongside PromoPill or other inline elements. */
  children?: React.ReactNode;
}

export interface PromoPillProps {
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Pill label text or content. Typically a short all-caps call-to-action. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro design system CSS custom property
// ---------------------------------------------------------------------------

const bannerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'var(--miro-primary)',
  color: 'var(--color-text-on-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-button-md)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.3,
  textAlign: 'center',
};

const pillStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: 'var(--space-xxs) var(--space-xs)',
  background: 'var(--miro-brand-yellow)',
  color: 'var(--color-text)',
  borderRadius: '9999px',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-micro)',
  fontWeight: 600,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

// ---------------------------------------------------------------------------
// PromoBanner
// ---------------------------------------------------------------------------

/**
 * Dark promotional banner for the Miro design system.
 *
 * Renders a full-width dark strip with centered content, used for time-sensitive
 * announcements like conference registration or seasonal offers. Typically paired
 * with an inline `<PromoPill>` to highlight the call-to-action.
 *
 * All colors, spacing, and typography bind to design-system CSS custom properties.
 * No raw hex values or hardcoded spacing are used.
 *
 * ```tsx
 * <PromoBanner>
 *   Convo'25 registration is open. Get up to 70% off on Annual{' '}
 *   <PromoPill>GET YOUR SPOT</PromoPill>
 * </PromoBanner>
 * ```
 */
export const PromoBanner = ({
  className,
  style,
  children,
  ...rest
}: PromoBannerProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={className}
      style={{
        ...bannerStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

PromoBanner.displayName = 'PromoBanner';

// ---------------------------------------------------------------------------
// PromoPill
// ---------------------------------------------------------------------------

/**
 * Inline yellow pill badge rendered inside a PromoBanner.
 *
 * Uses the Miro brand yellow background with dark text, styled as a fully-rounded
 * pill — matching the promo badge pattern seen across Miro's marketing surfaces.
 *
 * ```tsx
 * <PromoPill>GET YOUR SPOT</PromoPill>
 * ```
 */
export const PromoPill = ({
  className,
  style,
  children,
  ...rest
}: PromoPillProps & React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={className}
      style={{
        ...pillStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
};

PromoPill.displayName = 'PromoPill';

export default PromoBanner;
