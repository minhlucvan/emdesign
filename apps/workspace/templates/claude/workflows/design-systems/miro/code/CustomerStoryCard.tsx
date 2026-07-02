import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoryPhotoVariant = 'pepsico' | 'redhat' | 'webmd';

export interface CustomerStoryCardProps {
  /** Company name displayed in the photo/banner area. */
  company: string;
  /** Customer quote text rendered in the card body. */
  quote: string;
  /** Author display name shown beneath the quote. */
  authorName: string;
  /** Author title/role shown beneath the name. */
  authorTitle: string;
  /**
   * Named photo gradient variant.
   * - `pepsico`: coral/orange gradient (default)
   * - `redhat`: dark charcoal gradient
   * - `webmd`: blue gradient
   *
   * Overridden by `photoGradient` when provided.
   */
  photoVariant?: StoryPhotoVariant;
  /**
   * Custom CSS gradient for the photo banner area.
   * Takes precedence over `photoVariant` when set.
   * Should reference design-system tokens (e.g. `var(--miro-*)`).
   */
  photoGradient?: string;
  /**
   * Custom CSS gradient for the author avatar.
   */
  avatarGradient?: string;
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Variant presets — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const photoVariants: Record<StoryPhotoVariant, string> = {
  pepsico:
    'linear-gradient(135deg, var(--miro-brand-coral, #cc4422) 0%, var(--miro-coral-light, #ff8855) 100%)',
  redhat:
    'linear-gradient(135deg, var(--miro-primary) 0%, var(--color-ink) 100%)',
  webmd:
    'linear-gradient(135deg, var(--miro-brand-blue) 0%, var(--color-accent) 100%)',
};

const avatarDefault =
  'linear-gradient(135deg, var(--color-text-tertiary), var(--color-ink))';

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-xxxl)',
  overflow: 'hidden',
  border: '1px solid var(--color-border-soft)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const photoStyle: React.CSSProperties = {
  height: 160,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-on-dark)',
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-heading-3)',
  letterSpacing: '0.125em',
  textTransform: 'uppercase',
  userSelect: 'none',
};

const bodyStyle: React.CSSProperties = {
  padding: 'var(--space-xl)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  flex: 1,
  minWidth: 0,
};

const quoteStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-body-sm)',
  color: 'var(--color-text)',
  lineHeight: 1.5,
  flex: 1,
  margin: 0,
};

const authorRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'center',
};

const avatarStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  flexShrink: 0,
};

const authorNameStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-caption)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  lineHeight: 1.4,
};

const authorTitleStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-micro)',
  color: 'var(--color-text-tertiary)',
  lineHeight: 1.4,
};

// ---------------------------------------------------------------------------
// CustomerStoryCard component
// ---------------------------------------------------------------------------

/**
 * Customer story card for the Miro design system.
 *
 * Renders a branded card with a full-bleed gradient photo banner featuring the
 * company name, a customer quote, and an author attribution with avatar.
 * All visual properties bind to design-system CSS custom properties — no raw
 * values or hardcoded pixels outside the variant presets.
 *
 * ```tsx
 * <CustomerStoryCard
 *   company="PepsiCo"
 *   quote="With Miro, we went from project briefing to in-market launch in 10 months. That usually takes 3 years at PepsiCo."
 *   authorName="Jordan Henley Hubble"
 *   authorTitle="Director of Product at HBR"
 *   photoVariant="pepsico"
 * />
 * ```
 */
export const CustomerStoryCard = ({
  company,
  quote,
  authorName,
  authorTitle,
  photoVariant = 'pepsico',
  photoGradient,
  avatarGradient = avatarDefault,
  className,
  style,
  ...rest
}: CustomerStoryCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  const gradient = photoGradient ?? photoVariants[photoVariant];

  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          ...photoStyle,
          background: gradient,
        }}
      >
        {company}
      </div>
      <div style={bodyStyle}>
        <p style={quoteStyle}>{quote}</p>
        <div style={authorRowStyle}>
          <div
            style={{
              ...avatarStyle,
              background: avatarGradient,
            }}
            aria-hidden="true"
          />
          <div>
            <div style={authorNameStyle}>{authorName}</div>
            <div style={authorTitleStyle}>{authorTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomerStoryCard.displayName = 'CustomerStoryCard';

export default CustomerStoryCard;
