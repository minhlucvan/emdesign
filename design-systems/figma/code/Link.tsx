import React from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link content */
  children: React.ReactNode;
  /** Href destination */
  href: string;
}

/**
 * Inline link styled per Figma's link typography token.
 *
 * In the Figma design system, links are distinguished by **weight** (480 at
 * 20px) rather than by color change — body copy is always black
 * (`--color-ink`) and there is no separate link blue or mid-gray text.
 *
 * The underline uses `--color-hairline` so it reads as a subtle cue that
 * resolves to full ink on hover.
 */
export const Link: React.FC<LinkProps> = ({
  children,
  href,
  style,
  ...rest
}) => {
  return (
    <a
      href={href}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-link)',
        fontWeight: 'var(--font-weight-link)',
        lineHeight: 'var(--line-height-link)',
        letterSpacing: 'var(--letter-spacing-link)',
        color: 'var(--color-ink)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--color-hairline)',
        textUnderlineOffset: '4px',
        transition: 'text-decoration-color 0.15s ease, opacity 0.15s ease',
        cursor: 'pointer',
        fontFeatureSettings: '"kern"',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecorationColor = 'var(--color-ink)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecorationColor = 'var(--color-hairline)';
      }}
      {...rest}
    >
      {children}
    </a>
  );
};

Link.displayName = 'Link';
