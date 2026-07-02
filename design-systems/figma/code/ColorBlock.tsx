import React from 'react';

export type ColorBlockColor = 'lime' | 'lilac' | 'cream' | 'mint' | 'pink' | 'coral' | 'navy';

export interface ColorBlockProps {
  /** Color variant of the block — matches one of the seven block-* palette tokens */
  color?: ColorBlockColor;
  /** Eyebrow label rendered above the heading (figmaMono, uppercase) */
  eyebrow?: string;
  /** Section heading text */
  heading: string;
  /** Body paragraph text inside the block */
  body?: string;
  /** CTA button label (omitting this prop hides the CTA button) */
  cta?: string;
  /** Click handler for the CTA button */
  onCtaClick?: () => void;
  /** Additional inline styles applied to the root container */
  style?: React.CSSProperties;
  /** Additional CSS class names */
  className?: string;
  /** Children rendered inside the editorial column, above the CTA */
  children?: React.ReactNode;
}

const backgroundColors: Record<ColorBlockColor, string> = {
  lime: 'var(--color-block-lime)',
  lilac: 'var(--color-block-lilac)',
  cream: 'var(--color-block-cream)',
  mint: 'var(--color-block-mint)',
  pink: 'var(--color-block-pink)',
  coral: 'var(--color-block-coral)',
  navy: 'var(--color-block-navy)',
};

const textColors: Record<ColorBlockColor, string> = {
  lime: 'var(--color-ink)',
  lilac: 'var(--color-ink)',
  cream: 'var(--color-ink)',
  mint: 'var(--color-ink)',
  pink: 'var(--color-ink)',
  coral: 'var(--color-ink)',
  navy: 'var(--color-inverse-ink)',
};

/**
 * ColorBlock component — the signature narrative device of Figma's marketing
 * canvas. A full-width pastel panel with large rounded corners (`--rounded-lg`),
 * generous interior padding (`--spacing-xxl`), and a flexible editorial column.
 *
 * Supports seven color variants from the `--color-block-*` palette. The `navy`
 * variant automatically uses inverse-ink text for contrast.
 *
 * Optional slots: `eyebrow` (mono uppercase label), `body` (description text),
 * `cta` + `onCtaClick` (pill CTA button), and `children` for custom content.
 *
 * Above 768px the block keeps rounded corners and sits on white canvas.
 * Below 768px it becomes full-bleed (responsive consumers should adjust).
 */
export const ColorBlock = React.forwardRef<HTMLDivElement, ColorBlockProps>(
  (
    {
      color = 'lime',
      eyebrow,
      heading,
      body,
      cta,
      onCtaClick,
      style,
      className,
      children,
    },
    ref,
  ) => {
    const blockStyle: React.CSSProperties = {
      backgroundColor: backgroundColors[color],
      color: textColors[color],
      borderRadius: 'var(--rounded-lg)',
      padding: 'var(--spacing-xxl)',
      minHeight: '220px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFeatureSettings: '"kern"',
      ...style,
    };

    return (
      <div ref={ref} style={blockStyle} className={className}>
        <div>
          {eyebrow && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-eyebrow)',
                fontWeight: 'var(--font-weight-eyebrow)',
                lineHeight: 'var(--line-height-eyebrow)',
                letterSpacing: 'var(--letter-spacing-eyebrow)',
                textTransform: 'uppercase',
                fontFeatureSettings: '"kern"',
              }}
            >
              {eyebrow}
            </span>
          )}

          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-headline)',
              fontWeight: 'var(--font-weight-headline)',
              lineHeight: 'var(--line-height-headline)',
              letterSpacing: 'var(--letter-spacing-headline)',
              fontFeatureSettings: '"kern"',
              margin: 0,
            }}
          >
            {heading}
          </h2>

          {body && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-body)',
                lineHeight: 'var(--line-height-body)',
                letterSpacing: 'var(--letter-spacing-body)',
                fontFeatureSettings: '"kern"',
                margin: 'var(--spacing-md) 0 0',
              }}
            >
              {body}
            </p>
          )}

          {children}
        </div>

        {cta && (
          <button
            onClick={onCtaClick}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-button)',
              fontWeight: 'var(--font-weight-button)',
              lineHeight: 'var(--line-height-button)',
              letterSpacing: 'var(--letter-spacing-button)',
              fontFeatureSettings: '"kern"',
              backgroundColor:
                color === 'navy'
                  ? 'var(--color-canvas)'
                  : 'var(--color-primary)',
              color:
                color === 'navy'
                  ? 'var(--color-ink)'
                  : 'var(--color-on-primary)',
              borderRadius: 'var(--rounded-pill)',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              transition: 'opacity 0.15s ease',
              textDecoration: 'none',
            }}
          >
            {cta}
          </button>
        )}
      </div>
    );
  },
);

ColorBlock.displayName = 'ColorBlock';
