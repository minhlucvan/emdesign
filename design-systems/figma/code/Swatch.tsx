import React from 'react';

export interface SwatchProps {
  /** CSS custom property name, e.g. "--color-primary" or "--color-block-lime" */
  token: string;
  /** Human-readable label shown below the swatch */
  label: string;
  /** Hex value displayed beneath the label, e.g. "#000000" */
  hex: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Color swatch that displays a token value visually with its label and hex.
 *
 * Renders a filled square whose background is driven by the CSS custom
 * property (`var(${token})`), with the design-token name and hex value
 * shown beneath.
 *
 * Uses the design system's `--rounded-md` for the swatch square and
 * `--font-mono` for the hex display to match Figma's taxonomy-label
 * convention.
 */
export const Swatch: React.FC<SwatchProps> = ({
  token,
  label,
  hex,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-xxs)',
        fontFamily: 'var(--font-sans)',
        width: '120px',
        ...style,
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: `var(${token})`,
          borderRadius: 'var(--rounded-md)',
          border: '1px solid var(--color-hairline)',
        }}
      />
      <span
        style={{
          fontSize: '14px',
          fontWeight: 'var(--font-weight-body)',
          color: 'var(--color-ink)',
          textAlign: 'center',
          lineHeight: '1.3',
          wordBreak: 'break-word',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '12px',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
          opacity: 0.7,
        }}
      >
        {hex}
      </span>
    </div>
  );
};

Swatch.displayName = 'Swatch';
