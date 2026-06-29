/**
 * collectComputedStyles — unit tests.
 *
 * Tests for the collectComputedStyles(el) function that extracts a set of
 * CSS computed properties from a DOM element.
 */

import { collectComputedStyles } from '../dom-utils/computedStyles';

// ── Tests ──────────────────────────────────────────────────────────────

describe('collectComputedStyles', () => {
  it('returns an object', () => {
    const result = collectComputedStyles({} as Element);
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns object with expected CSS property keys', () => {
    const mockStyles: Record<string, string> = {
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
      fontSize: '16px',
      fontWeight: '400',
      borderRadius: '0px',
      boxShadow: 'none',
      display: 'block',
      position: 'static',
    };

    // Create a mock element with getComputedStyle mocked via globalThis
    const origGetComputedStyle = globalThis.getComputedStyle;
    globalThis.getComputedStyle = (() => ({
      getPropertyValue: (key: string) => mockStyles[key] ?? '',
    })) as unknown as typeof globalThis.getComputedStyle;

    try {
      const el = { nodeType: 1 } as Element;
      const result = collectComputedStyles(el);
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('backgroundColor');
      expect(result).toHaveProperty('fontSize');
      expect(result).toHaveProperty('fontWeight');
      expect(result).toHaveProperty('borderRadius');
      expect(result).toHaveProperty('boxShadow');
      expect(result).toHaveProperty('display');
      expect(result).toHaveProperty('position');
    } finally {
      globalThis.getComputedStyle = origGetComputedStyle;
    }
  });

  it('returns string values for each CSS property', () => {
    const mockStyles: Record<string, string> = {
      color: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      fontSize: '14px',
      fontWeight: '700',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      position: 'relative',
      marginTop: '0px',
      marginRight: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      paddingTop: '8px',
      paddingRight: '16px',
      paddingBottom: '8px',
      paddingLeft: '16px',
    };

    const origGetComputedStyle = globalThis.getComputedStyle;
    globalThis.getComputedStyle = (() => ({
      getPropertyValue: (key: string) => mockStyles[key] ?? '',
    })) as unknown as typeof globalThis.getComputedStyle;

    try {
      const result = collectComputedStyles({} as Element);
      for (const [key, val] of Object.entries(mockStyles)) {
        expect(result[key]).toBe(val);
      }
    } finally {
      globalThis.getComputedStyle = origGetComputedStyle;
    }
  });

  it('handles missing getComputedStyle gracefully — does not throw', () => {
    const origGetComputedStyle = globalThis.getComputedStyle;
    // Simulate environment where getComputedStyle is undefined (e.g. node, ssr)
    delete (globalThis as Partial<typeof globalThis>).getComputedStyle;

    try {
      // Should not throw
      const result = collectComputedStyles({} as Element);
      expect(result).toEqual({});
    } finally {
      globalThis.getComputedStyle = origGetComputedStyle;
    }
  });

  it('handles getComputedStyle returning null gracefully', () => {
    const origGetComputedStyle = globalThis.getComputedStyle;
    globalThis.getComputedStyle = (() => null) as unknown as typeof globalThis.getComputedStyle;

    try {
      // Should not throw
      const result = collectComputedStyles({} as Element);
      expect(result).toEqual({});
    } finally {
      globalThis.getComputedStyle = origGetComputedStyle;
    }
  });

  it('handles CSS property access throwing (cross-origin) gracefully', () => {
    const origGetComputedStyle = globalThis.getComputedStyle;
    // Simulate cross-origin iframe — getPropertyValue throws
    globalThis.getComputedStyle = (() => ({
      get getPropertyValue() {
        throw new DOMException('', 'SecurityError');
      },
    })) as unknown as typeof globalThis.getComputedStyle;

    try {
      // Should not throw
      const result = collectComputedStyles({} as Element);
      expect(result).toEqual({});
    } finally {
      globalThis.getComputedStyle = origGetComputedStyle;
    }
  });
});
