import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroProps {
  /** Hero headline text (hero-display type scale) */
  heading: string;
  /** Supporting subtitle / description */
  subtitle?: string;
  /** Call-to-action buttons or other action elements shown below the text */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  padding: 'var(--space-section-hero) var(--space-xxl)',
  background: 'var(--color-surface)',
  maxWidth: 1280,
  margin: '0 auto',
  textAlign: 'left',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-hero-display)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.05,
  letterSpacing: '-0.025em',
  color: 'var(--color-text)',
  margin: 0,
  marginBottom: 'var(--space-xl)',
  maxWidth: 1100,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-subtitle)',
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  margin: 0,
  marginBottom: 'var(--space-xxxl)',
  maxWidth: 720,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
};

// ---------------------------------------------------------------------------
// Hero component
// ---------------------------------------------------------------------------

/**
 * Hero section for the Miro design system.
 *
 * Renders a centered, white-background hero with a large heading, optional
 * subtitle, and optional action buttons. All colors and spacing reference
 * design-system CSS custom properties — no raw values or hardcoded pixels.
 *
 * ```tsx
 * <Hero
 *   heading="Design System Analysis of Miro"
 *   subtitle="Miro positions itself as the AI-powered visual workspace…"
 *   actions={
 *     <>
 *       <Button variant="primary">Get started free</Button>
 *       <Button variant="secondary">Book a demo</Button>
 *     </>
 *   }
 * />
 * ```
 */
export const Hero = ({
  heading,
  subtitle,
  actions,
  className,
  style,
}: HeroProps) => {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
    >
      <h1 style={headingStyle}>{heading}</h1>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      {actions && <div style={actionsStyle}>{actions}</div>}
    </div>
  );
};

Hero.displayName = 'Hero';

export default Hero;
