import React, { forwardRef } from 'react';

/* ---------------------------------------------------------------------------
 * PricingTab — Pill-shaped toggle tab for the pricing page tier switcher
 *
 * Design tokens (from DESIGN.md / tokens.css):
 *   Default:  bg=--color-canvas  text=--color-ink        border=1px --color-hairline-soft
 *   Selected: bg=--color-primary text=--color-on-primary  border=none
 *   Typography: --font-button (20px/480/1.40/-0.10px)
 *   Radius: --rounded-pill (50px)
 *   Padding: 8px 18px
 * ------------------------------------------------------------------------- */

export interface PricingTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visible label inside the tab */
  label: string;
  /** Whether this tab is the currently selected one */
  selected?: boolean;
}

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  border: 'none',
  cursor: 'pointer',
  WebkitFontSmoothing: 'antialiased',
  /* Pill shape */
  borderRadius: 'var(--rounded-pill, 50px)',
  /* Padding */
  padding: '8px 18px',
  /* Typography: button role */
  fontFamily: 'figmaSans, "figmaSans Fallback", "SF Pro Display", system-ui, helvetica, sans-serif',
  fontSize: '20px',
  fontWeight: 480,
  lineHeight: 1.40,
  letterSpacing: '-0.10px',
  fontFeatureSettings: '"kern" 1',
  /* Min tap target */
  minHeight: '44px',
  /* Smooth transitions */
  transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
  /* Reset button defaults */
  outline: 'none',
};

const defaultStyle: React.CSSProperties = {
  ...baseStyles,
  background: 'var(--color-canvas, #ffffff)',
  color: 'var(--color-ink, #000000)',
  border: '1px solid var(--color-hairline-soft, #f1f1f1)',
};

const selectedStyle: React.CSSProperties = {
  ...baseStyles,
  background: 'var(--color-primary, #000000)',
  color: 'var(--color-on-primary, #ffffff)',
  border: 'none',
};

function useHover() {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    };
  }, []);
  return { ref, isHovered };
}

const PricingTab = forwardRef<HTMLButtonElement, PricingTabProps>(
  ({ label, selected = false, style, onMouseEnter, onMouseLeave, ...rest }, forwardedRef) => {
    const internalRef = React.useRef<HTMLButtonElement | null>(null);

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [active, setActive] = React.useState(false);

    const resolvedBase = selected ? selectedStyle : defaultStyle;

    /* -----------------------------------------------------------------------
     * Interactive-state overrides.
     * Hover on default tab: slightly darker border (--color-hairline).
     * Focus: subtle ring.
     * Active/pressed: micro-scale transform.
     * ----------------------------------------------------------------------- */
    const interactiveOverrides: React.CSSProperties = {};

    if (!selected) {
      if (hovered) {
        interactiveOverrides.borderColor = 'var(--color-hairline, #e6e6e6)';
      }
      if (active) {
        interactiveOverrides.transform = 'scale(0.97)';
        interactiveOverrides.borderColor = 'var(--color-hairline, #e6e6e6)';
      }
    } else {
      if (hovered) {
        // Selected hover: slightly lighter black
        interactiveOverrides.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        interactiveOverrides.background = undefined;
        interactiveOverrides.backgroundClip = 'padding-box';
      }
      if (active) {
        interactiveOverrides.transform = 'scale(0.97)';
      }
    }

    if (focused) {
      interactiveOverrides.outline = 'none';
      interactiveOverrides.boxShadow = '0 0 0 2px var(--color-ink, #000000)';
    }

    const resolvedStyle: React.CSSProperties = {
      ...resolvedBase,
      ...interactiveOverrides,
      ...style,
    };

    return (
      <button
        ref={mergedRef}
        role="tab"
        aria-selected={selected}
        style={resolvedStyle}
        onMouseEnter={(e) => {
          setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        onFocus={(e) => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
        onPointerLeave={() => setActive(false)}
        {...rest}
      >
        {label}
      </button>
    );
  },
);

PricingTab.displayName = 'PricingTab';

export { PricingTab };
export default PricingTab;
