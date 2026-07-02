import React from 'react';

export type TextVariant = 'body' | 'body-sm' | 'caption' | 'code';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div';
}

/* ---- Static style maps ---- */

const baseStyle: React.CSSProperties = {
  color: 'var(--color-text)',
  margin: 0,
};

const variantStyle: Record<TextVariant, React.CSSProperties> = {
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-body-md)',
    fontWeight: 'var(--font-weight-body-md)',
    lineHeight: 'var(--line-height-body-md)',
    letterSpacing: 'var(--letter-spacing-body-md)',
  },
  'body-sm': {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-body-tabular)',
    fontWeight: 'var(--font-weight-body-md)',
    lineHeight: 'var(--line-height-body-md)',
    letterSpacing: 'var(--letter-spacing-body-md)',
  },
  caption: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-caption)',
    fontWeight: 'var(--font-weight-caption)',
    lineHeight: 'var(--line-height-caption)',
    letterSpacing: 'var(--letter-spacing-caption)',
  },
  code: {
    fontFamily:
      "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace",
    fontSize: 'var(--font-size-body-tabular)',
    fontWeight: 'var(--font-weight-body-md)',
    lineHeight: 'var(--line-height-body-md)',
    letterSpacing: 'var(--letter-spacing-body-md)',
  },
};

/* ---- Component ---- */

const Text: React.FC<TextProps> = ({
  variant = 'body',
  as: Tag = 'p',
  style,
  children,
  ...props
}) => {
  return (
    <Tag
      style={{
        ...baseStyle,
        ...variantStyle[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Text;
