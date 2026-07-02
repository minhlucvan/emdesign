import React from 'react';

type TextVariant = 'body' | 'body-sm' | 'caption' | 'code';

export interface TextProps {
  /** Typography variant */
  variant?: TextVariant;
  /** Text content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** HTML element to render (p, span, div, label, etc.) */
  as?: 'p' | 'span' | 'div' | 'label';
}

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-body)',
    lineHeight: 'var(--line-height-body)',
    letterSpacing: 'var(--letter-spacing-body)',
  },
  'body-sm': {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-body-sm)',
    fontWeight: 'var(--font-weight-body-sm)',
    lineHeight: 'var(--line-height-body-sm)',
    letterSpacing: 'var(--letter-spacing-body-sm)',
  },
  caption: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-caption)',
    fontWeight: 'var(--font-weight-caption)',
    lineHeight: 'var(--line-height-caption)',
    letterSpacing: 'var(--letter-spacing-caption)',
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.45',
    letterSpacing: '0',
  },
};

/**
 * Body text component using figmaSans (or figmaMono for caption/code).
 *
 * | Variant  | Font         | Size | Weight | Line-Height | Tracking | Notes                |
 * |----------|-------------|------|--------|-------------|----------|----------------------|
 * | body     | figmaSans   | 18px | 320    | 1.45        | -0.26px  | Default body         |
 * | body-sm  | figmaSans   | 16px | 330    | 1.45        | -0.14px  | Card / footer body   |
 * | caption  | figmaMono   | 12px | 400    | 1.00        | 0.60px   | Uppercase, taxonomy  |
 * | code     | figmaMono   | 14px | 400    | 1.45        | 0        | Inline code snippet  |
 *
 * Per Figma's design system, body hierarchy comes from weight, not opacity.
 * There is no mid-gray text role — body copy is always black at weight 320-340.
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  children,
  style,
  as: Tag = 'p',
}) => {
  const baseStyle: React.CSSProperties = {
    color: 'var(--color-ink)',
    margin: 0,
    fontFeatureSettings: '"kern"',
  };

  return (
    <Tag style={{ ...baseStyle, ...variantStyles[variant], ...style }}>
      {children}
    </Tag>
  );
};

Text.displayName = 'Text';
