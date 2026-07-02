import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PastelCardVariant = 'yellow' | 'coral' | 'teal' | 'rose';

export interface PastelCardProps {
  /** Card color variant. Defaults to 'yellow'. */
  variant?: PastelCardVariant;
  /** Badge/tag label displayed at the top of the card (e.g. "Templates"). */
  tag?: string;
  /** Card heading text. */
  title?: React.ReactNode;
  /** Card description text. */
  description?: React.ReactNode;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Custom content override — when provided, title/description are ignored. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Card variant style map — every value binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const cardVariantStyles: Record<PastelCardVariant, React.CSSProperties> = {
  yellow: {
    background: 'var(--miro-brand-yellow)',
    color: 'var(--color-ink)',
  },
  coral: {
    background: 'var(--miro-coral-light)',
    color: 'var(--color-ink)',
  },
  teal: {
    background: 'var(--miro-teal-light)',
    color: 'var(--color-ink)',
  },
  rose: {
    background: 'var(--miro-rose-light)',
    color: 'var(--color-ink)',
  },
};

// ---------------------------------------------------------------------------
// Base styles — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const cardBaseStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-xxxl)',
  padding: 'var(--space-xxl)',
  minHeight: 260,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
};

const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: 'var(--space-xxs) var(--space-sm)',
  borderRadius: 'var(--radius-pill)',
  background: 'rgba(0,0,0,0.1)',
  fontSize: 'var(--font-size-caption)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 1.4,
  alignSelf: 'flex-start',
  width: 'fit-content',
};

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-heading-3)',
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.25,
  letterSpacing: '-0.3px',
  margin: 0,
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  opacity: 0.8,
  lineHeight: 1.5,
  margin: 0,
};

const contentWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xxs)',
};

// ---------------------------------------------------------------------------
// PastelCard component
// ---------------------------------------------------------------------------

/**
 * `PastelCard` — standalone pastel-tinted card for the Miro design system.
 *
 * Renders a single card from the Miro sticky-note palette (yellow, coral, teal,
 * rose) with the signature 28px (`--radius-xxxl`) corner softening. Cards
 * feature an optional pill-shaped tag badge, a heading, and a short description
 * in a vertically stacked layout.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * When `children` are provided, they replace the default title/description
 * layout entirely, allowing custom composition.
 *
 * ```tsx
 * <PastelCard variant="yellow" tag="Templates" title="Templates" description="Get started with thousands of templates." />
 *
 * <PastelCard variant="teal">
 *   <Heading level={3}>Custom content</Heading>
 *   <Text variant="body">Fully composed content inside the card.</Text>
 * </PastelCard>
 * ```
 */
export function PastelCard({
  variant = 'yellow',
  tag,
  title,
  description,
  className,
  style,
  children,
  ...rest
}: PastelCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const isCustomContent = children !== undefined;

  return (
    <div
      className={className}
      style={{
        ...cardBaseStyle,
        ...cardVariantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {isCustomContent ? (
        children
      ) : (
        <>
          {tag && <span style={tagStyle}>{tag}</span>}
          {(title || description) && (
            <div style={contentWrapperStyle}>
              {title && <h4 style={titleStyle}>{title}</h4>}
              {description && <p style={descriptionStyle}>{description}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

PastelCard.displayName = 'PastelCard';

export default PastelCard;
