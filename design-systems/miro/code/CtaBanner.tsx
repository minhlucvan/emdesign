import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CtaBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading text displayed at the top of the banner. */
  heading?: React.ReactNode;
  /** Supporting description text below the heading. */
  description?: React.ReactNode;
  /** Label for the call-to-action pill button. When omitted, no CTA is rendered. */
  ctaLabel?: string;
  /** URL for the CTA button. When set renders an <a>, otherwise a <button>. */
  ctaHref?: string;
  /** Additional class names for custom styling. */
  className?: string;
  /** Custom content override — when provided, heading/description/ctaLabel are ignored. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const bannerStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-primary)',
  color: 'var(--miro-on-primary)',
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-feature)',
  padding: 'var(--space-xxl)',
  boxSizing: 'border-box',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 'var(--space-md)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: 'var(--font-size-heading-2)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 'var(--line-height-heading-2)',
  letterSpacing: 'var(--letter-spacing-heading-2)',
  color: 'var(--miro-on-primary)',
  margin: 0,
  maxWidth: 720,
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.6,
  color: 'var(--miro-on-primary)',
  opacity: 0.85,
  margin: 0,
  maxWidth: 560,
};

const ctaBaseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 1,
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-sm) var(--space-lg)',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-xxs)',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  textDecoration: 'none',
  transition: 'opacity var(--motion-fast) ease',
  userSelect: 'none',
  marginTop: 'var(--space-sm)',
};

const ctaDefaultStyle: React.CSSProperties = {
  backgroundColor: 'var(--miro-on-primary)',
  color: 'var(--miro-primary)',
};

// ---------------------------------------------------------------------------
// CtaBanner component
// ---------------------------------------------------------------------------

/**
 * `CtaBanner` — full-width call-to-action banner for the Miro design system.
 *
 * Renders a centered stack of heading, description, and a Miro-brand CTA pill
 * on the signature dark ink background (`--miro-primary`). The banner uses the
 * large `--radius-feature` (32px) corner radius consistent with hero sections.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * When `children` are provided, they replace the default heading/description/CTA
 * layout entirely, allowing custom composition (e.g. embedding a form or a row of
 * CTAs).
 *
 * ```tsx
 * <CtaBanner
 *   heading="Get started with Miro"
 *   description="Join 100M+ users and collaborate on an infinite canvas."
 *   ctaLabel="Sign up free"
 *   ctaHref="https://miro.com/signup"
 * />
 *
 * <CtaBanner>
 *   <Heading level={2}>Custom layout</Heading>
 *   <Text variant="body">Fully composed content.</Text>
 * </CtaBanner>
 * ```
 */
export function CtaBanner({
  heading,
  description,
  ctaLabel,
  ctaHref,
  className,
  style,
  children,
  ...rest
}: CtaBannerProps) {
  const isCustomContent = children !== undefined;

  return (
    <div
      className={className}
      style={{
        ...bannerStyle,
        ...style,
      }}
      {...rest}
    >
      {isCustomContent ? (
        children
      ) : (
        <>
          {heading && <h2 style={headingStyle}>{heading}</h2>}
          {description && <p style={descriptionStyle}>{description}</p>}
          {ctaLabel &&
            (ctaHref ? (
              <a
                href={ctaHref}
                style={{
                  ...ctaBaseStyle,
                  ...ctaDefaultStyle,
                }}
              >
                {ctaLabel}
              </a>
            ) : (
              <button
                type="button"
                style={{
                  ...ctaBaseStyle,
                  ...ctaDefaultStyle,
                }}
              >
                {ctaLabel}
              </button>
            ))}
        </>
      )}
    </div>
  );
}

CtaBanner.displayName = 'CtaBanner';

export default CtaBanner;
