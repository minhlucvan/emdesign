import React from 'react';

type BadgeColor = 'accent' | 'success' | 'warn' | 'danger';

export interface BadgeProps {
  /** Color semantic variant */
  color?: BadgeColor;
  /** Badge content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  accent: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
  },
  success: {
    backgroundColor: 'var(--color-semantic-success)',
    color: 'var(--color-on-primary)',
  },
  warn: {
    backgroundColor: 'var(--color-block-cream)',
    color: 'var(--color-ink)',
  },
  danger: {
    backgroundColor: 'var(--color-accent-magenta)',
    color: 'var(--color-on-primary)',
  },
};

/**
 * Small label badge with color variants.
 *
 * Uses `--font-mono` (figmaMono) with caption-scale typography —
 * uppercase, positive letter-spacing — matching Figma's taxonomy-label
 * convention (eyebrow / caption roles).
 *
 * Color variants:
 * - **accent** — black (`--color-primary`)
 * - **success** — green (`--color-semantic-success`)
 * - **warn** — warm cream (`--color-block-cream`)
 * - **danger** — magenta (`--color-accent-magenta`)
 */
export const Badge: React.FC<BadgeProps> = ({
  color = 'accent',
  children,
  style,
}) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-caption)',
        fontWeight: 'var(--font-weight-caption)',
        lineHeight: 'var(--line-height-caption)',
        letterSpacing: 'var(--letter-spacing-caption)',
        textTransform: 'uppercase',
        padding: 'var(--spacing-xxs) var(--spacing-xs)',
        borderRadius: 'var(--rounded-sm)',
        whiteSpace: 'nowrap',
        fontFeatureSettings: '"kern"',
        ...colorStyles[color],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
