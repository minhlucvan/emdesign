import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeviceLadderItem {
  /** Breakpoint label shown inside the device block (e.g. "375px"). */
  label: string;
  /** Visual width of the device rectangle in the ladder display. */
  width: number;
  /** Visual height of the device rectangle in the ladder display. */
  height: number;
}

export interface DeviceLadderProps {
  /** Optional section heading rendered above the ladder. */
  title?: string;
  /**
   * Device breakpoint items. Defaults to the standard Miro breakpoint set:
   * 375px, 480px, 768px, 1024px, 1280+.
   */
  items?: DeviceLadderItem[];
  /** Additional CSS class names. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Default breakpoint ladder data
// ---------------------------------------------------------------------------

const DEFAULT_ITEMS: DeviceLadderItem[] = [
  { label: '375px', width: 60, height: 110 },
  { label: '480px', width: 90, height: 130 },
  { label: '768px', width: 130, height: 150 },
  { label: '1024px', width: 200, height: 170 },
  { label: '1280+', width: 280, height: 200 },
];

// ---------------------------------------------------------------------------
// Styles — every value binds to a Miro semantic CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-md)',
  alignItems: 'flex-end',
  padding: 'var(--space-xxl)',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-heading-3)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text)',
  lineHeight: 1.25,
  letterSpacing: '-0.5px',
  margin: 0,
  width: '100%',
};

const deviceBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: 'var(--space-xs)',
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-border-soft)',
  fontSize: 'var(--font-size-micro)',
  color: 'var(--color-text-tertiary)',
  fontWeight: 'var(--font-weight-medium)',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
};

// ---------------------------------------------------------------------------
// DeviceLadder component
// ---------------------------------------------------------------------------

/**
 * DeviceLadder — visual breakpoint progression display for responsive design
 * documentation.
 *
 * Renders a horizontal ladder of ascending device rectangles, each labeled
 * with its viewport width, showing how the design scales from mobile to wide
 * desktop. Every visual property binds to a Miro design-system CSS custom
 * property — no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * <DeviceLadder title="Device Ladder" />
 * <DeviceLadder
 *   title="Custom Breakpoints"
 *   items={[
 *     { label: '360px', width: 56, height: 100 },
 *     { label: '768px', width: 120, height: 140 },
 *   ]}
 * />
 * ```
 */
export const DeviceLadder = ({
  title,
  items = DEFAULT_ITEMS,
  className,
  style,
  ...rest
}: DeviceLadderProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
      {...rest}
    >
      {title && <h3 style={headingStyle}>{title}</h3>}
      {items.map((device, index) => (
        <div
          key={index}
          style={{
            ...deviceBaseStyle,
            width: device.width,
            height: device.height,
          }}
        >
          {device.label}
        </div>
      ))}
    </div>
  );
};

DeviceLadder.displayName = 'DeviceLadder';

export default DeviceLadder;
