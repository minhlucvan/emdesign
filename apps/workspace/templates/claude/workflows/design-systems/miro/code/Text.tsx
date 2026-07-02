import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TextVariant =
  | 'body-md'
  | 'body-sm'
  | 'subtitle'
  | 'caption'
  | 'caption-bold'
  | 'micro';

export interface TextProps {
  /** Text content. */
  children: React.ReactNode;
  /** Type variant from the Miro type scale. Defaults to 'body-md'. */
  variant?: TextVariant;
  /** Semantic HTML element to render. Defaults to 'p'. */
  as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'figcaption';
  /** Additional class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Variant definitions — every value binds to a Miro semantic CSS custom
// property per the build-context type scale and the 3 anti-pattern rules.
// ---------------------------------------------------------------------------

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  subtitle: {
    fontSize: 'var(--font-size-subtitle)',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'var(--color-text-muted)',
  },
  'body-md': {
    fontSize: 'var(--font-size-body-md)',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'var(--color-text)',
  },
  'body-sm': {
    fontSize: 'var(--font-size-body-sm)',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'var(--color-text)',
  },
  caption: {
    fontSize: 'var(--font-size-caption)',
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'var(--color-text-tertiary)',
  },
  'caption-bold': {
    fontSize: 'var(--font-size-caption-bold)',
    fontWeight: 600,
    lineHeight: 1.4,
    color: 'var(--color-text-tertiary)',
    letterSpacing: '0.02em',
  },
  micro: {
    fontSize: 'var(--font-size-micro)',
    fontWeight: 500,
    lineHeight: 1.4,
    color: 'var(--color-text-tertiary)',
  },
};

const rootStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  margin: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Text component
// ---------------------------------------------------------------------------

/**
 * `Text` — generic text primitive for the Miro design system.
 *
 * Renders body, caption, subtitle, and micro text using the Miro type scale.
 * All colors and typography bind to design-system CSS custom properties — no
 * raw hex values or hardcoded spacing.
 *
 * ```tsx
 * <Text variant="body-md">
 *   Miro positions itself as the AI-powered visual workspace…
 * </Text>
 * <Text variant="body-sm" as="span">
 *   Secondary body text
 * </Text>
 * <Text variant="caption">Helper text</Text>
 * ```
 */
export function Text({
  children,
  variant = 'body-md',
  as: Component = 'p',
  className,
  style,
}: TextProps) {
  return (
    <Component
      className={className}
      style={{
        ...rootStyle,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

Text.displayName = 'Text';

export default Text;
