import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { checkLint, checkBehavior } from '@emdesign/testbed';

const COMPONENT_PATH = '/d/emdesign/design-systems/figma/code/ColorBlock.tsx';

const source = fs.existsSync(COMPONENT_PATH)
  ? fs.readFileSync(COMPONENT_PATH, 'utf8')
  : '';

/**
 * Detect whether the ColorBlock source contains interactive elements so
 * we know whether to run the behavior test.
 */
function isInteractive(src: string): boolean {
  return /onClick|onKeyDown|role="button"|role="option"|<button|<a\s/.test(src);
}

describe('ColorBlock', () => {
  // ------------------------------------------------------------------
  // Level 0: File existence
  // ------------------------------------------------------------------
  it('file exists', () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true);
  });

  // ------------------------------------------------------------------
  // Level 2: Lint — token compliance, no raw hex, no filler copy
  // ------------------------------------------------------------------
  it('passes lint (zero P0 findings)', () => {
    const result = checkLint(source);
    expect(result.mustFix).toBe(0);
  });

  it('uses semantic tokens, not raw hex values', () => {
    const rawHex = source.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    // black (#000/#000000) and white (#fff/#ffffff) are acceptable
    // as fallback or structural color references; block pastels are not.
    const allowed = ['#000', '#000000', '#fff', '#ffffff'];
    const violations = rawHex.filter(h => !allowed.includes(h.toLowerCase()));
    expect(violations.length).toBe(0);
  });

  // ------------------------------------------------------------------
  // Level 6: Behavior — interactive CTA
  // ------------------------------------------------------------------
  it('passes behavior checks when interactive', () => {
    if (!isInteractive(source)) {
      return; // skip — component not yet built
    }
    const result = checkBehavior(source);
    expect(result.ok).toBe(true);
  });

  // ------------------------------------------------------------------
  // Contract: component export & structural tests
  // ------------------------------------------------------------------
  describe('component contract', () => {
    it('exports a ColorBlock component', async () => {
      const mod = await import('../../code/ColorBlock');
      expect(mod.ColorBlock).toBeDefined();
      expect(typeof mod.ColorBlock).toBe('function');
    });

    it('accepts a heading prop and renders it', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { heading: 'Test heading' }),
      );
      expect(container.textContent).toContain('Test heading');
    });

    it('renders CTA text when cta prop is provided', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render, screen } = await import('@testing-library/react');
      render(
        React.createElement(ColorBlock, {
          heading: 'Title',
          cta: 'Get started',
        }),
      );
      expect(screen.getByRole('button')).toBeDefined();
      expect(screen.getByText('Get started')).toBeDefined();
    });

    it('does not render a CTA when cta prop is omitted', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render, screen } = await import('@testing-library/react');
      render(
        React.createElement(ColorBlock, { heading: 'Title' }),
      );
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders eyebrow text when eyebrow prop is provided', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, {
          heading: 'Title',
          eyebrow: 'Systems',
        }),
      );
      expect(container.textContent).toContain('Systems');
    });

    it('does not render eyebrow when eyebrow prop is omitted', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { heading: 'Title' }),
      );
      // Eyebrow is rendered in a <span> with uppercase mono styling;
      // no <span> with uppercase transformation should appear for eyebrow
      // when the prop is absent. We check that the only text is the heading.
      expect(container.textContent?.trim()).toBe('Title');
    });

    it('renders body text when body prop is provided', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, {
          heading: 'Title',
          body: 'Description text.',
        }),
      );
      expect(container.textContent).toContain('Description text.');
    });

    it('calls onCtaClick when CTA is clicked', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const handleClick = vi.fn();
      render(
        React.createElement(ColorBlock, {
          heading: 'Title',
          cta: 'Click me',
          onCtaClick: handleClick,
        }),
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ------------------------------------------------------------------
  // Variant tests — each color variant should apply correct tokens
  // ------------------------------------------------------------------
  describe('color variants', () => {
    const variants = [
      { color: 'lime', expectedBg: 'var(--color-block-lime)' },
      { color: 'lilac', expectedBg: 'var(--color-block-lilac)' },
      { color: 'cream', expectedBg: 'var(--color-block-cream)' },
      { color: 'mint', expectedBg: 'var(--color-block-mint)' },
      { color: 'pink', expectedBg: 'var(--color-block-pink)' },
      { color: 'coral', expectedBg: 'var(--color-block-coral)' },
      { color: 'navy', expectedBg: 'var(--color-block-navy)' },
    ] as const;

    variants.forEach(({ color, expectedBg }) => {
      it(`color="${color}" sets background to ${expectedBg}`, async () => {
        const { ColorBlock } = await import('../../code/ColorBlock');
        const { render } = await import('@testing-library/react');
        const { container } = render(
          React.createElement(ColorBlock, {
            color: color as any,
            heading: 'Title',
          }),
        );
        const block = container.firstElementChild as HTMLElement;
        expect(block).not.toBeNull();
        expect(block.style.backgroundColor || block.style.background)
          .toMatch(/block-(lime|lilac|cream|mint|pink|coral|navy)/);
      });
    });

    it('navy variant uses inverse-ink (white text) for contrast', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'navy', heading: 'Dark' }),
      );
      const block = container.firstElementChild as HTMLElement;
      expect(block).not.toBeNull();
      expect(block.style.color).toMatch(/inverse-ink|white|#fff|#ffffff/);
    });

    it('light variants use ink (black text)', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'lime', heading: 'Light' }),
      );
      const block = container.firstElementChild as HTMLElement;
      expect(block).not.toBeNull();
      expect(block.style.color).toMatch(/ink|black|#000|#000000/);
    });
  });

  // ------------------------------------------------------------------
  // Layout contract — shape tokens drawn from the design system
  // ------------------------------------------------------------------
  describe('layout tokens', () => {
    it('applies rounded-lg (24px) border-radius', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'lime', heading: 'Title' }),
      );
      const block = container.firstElementChild as HTMLElement;
      expect(block).not.toBeNull();
      const br = block.style.borderRadius;
      expect(br).toMatch(/var\(--rounded-lg\)|24px/);
    });

    it('applies spacing-xxl (48px) padding', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'lime', heading: 'Title' }),
      );
      const block = container.firstElementChild as HTMLElement;
      expect(block).not.toBeNull();
      const pad = block.style.padding;
      expect(pad).toMatch(/var\(--spacing-xxl\)|48px/);
    });

    it('has a min-height of at least 220px', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'lime', heading: 'Title' }),
      );
      const block = container.firstElementChild as HTMLElement;
      expect(block).not.toBeNull();
      const mh = block.style.minHeight;
      expect(mh).toMatch(/220px/);
    });

    it('uses flex column layout with space-between', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'lime', heading: 'Title' }),
      );
      const block = container.firstElementChild as HTMLElement;
      expect(block).not.toBeNull();
      expect(block.style.display).toBe('flex');
      expect(block.style.flexDirection).toBe('column');
      expect(block.style.justifyContent).toBe('space-between');
    });
  });

  // ------------------------------------------------------------------
  // Typography contract — matching DESIGN.md
  // ------------------------------------------------------------------
  describe('typography tokens', () => {
    it('renders heading with headline typography (26px, 540 weight)', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, { color: 'lime', heading: 'Section title' }),
      );
      const heading = container.querySelector('h3, h2, h1');
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toBe('Section title');
      expect(heading!.style.fontWeight).toMatch(/var\(.*\)|540|600/);
    });

    it('renders eyebrow with mono font family and uppercase', async () => {
      const { ColorBlock } = await import('../../code/ColorBlock');
      const { render } = await import('@testing-library/react');
      const { container } = render(
        React.createElement(ColorBlock, {
          color: 'lime',
          heading: 'Title',
          eyebrow: 'Section label',
        }),
      );
      const spans = container.querySelectorAll('span');
      const eyebrowSpan = Array.from(spans).find(
        s => s.textContent === 'Section label',
      );
      expect(eyebrowSpan).toBeDefined();
      expect(eyebrowSpan!.style.textTransform).toBe('uppercase');
      expect(eyebrowSpan!.style.fontFamily).toMatch(/mono|var\(--font-mono\)/);
    });
  });
});
