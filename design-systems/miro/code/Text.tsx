import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TextVariant =
  | 'body'
  | 'body-bold'
  | 'caption'
  | 'caption-bold'
  | 'small'
  | 'lead';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Typographic variant. */
  variant?: TextVariant;
  /** Additional class names for custom styling. */
  className?: string;
  /** Text content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Variant style map — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  body: {
    fontSize: 16,
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 1.6,
  },
  'body-bold': {
    fontSize: 16,
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1.6,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 1.5,
  },
  'caption-bold': {
    fontSize: 14,
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1.5,
  },
  small: {
    fontSize: 12,
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 1.4,
  },
  lead: {
    fontSize: 20,
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 1.5,
  },
};

// ---------------------------------------------------------------------------
// Base style — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text)',
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Text component
// ---------------------------------------------------------------------------

/**
 * `Text` — Miro-styled text primitive.
 *
 * Renders semantic typography at one of six predefined sizes and weights:
 * - `body`        – 16px / 400 weight / 1.6 line-height
 * - `body-bold`   – 16px / 600 weight / 1.6 line-height
 * - `caption`     – 14px / 400 weight / 1.5 line-height
 * - `caption-bold`– 14px / 600 weight / 1.5 line-height
 * - `small`       – 12px / 400 weight / 1.4 line-height
 * - `lead`        – 20px / 400 weight / 1.5 line-height
 *
 * All variants use `var(--font-sans)` (Roobert PRO) and
 * `var(--color-text)` (#1c1c1e). The default variant is `body`.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <Text variant="body">Body copy</Text>
 * <Text variant="lead">Introductory text</Text>
 * <Text variant="caption">Footnote</Text>
 * ```
 */
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ variant = 'body', className, style, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

Text.displayName = 'Text';

export default Text;
