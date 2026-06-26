/** Generated from plank token contract by emdesign */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './design-systems/**/code/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        border: 'var(--color-border)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        warn: 'var(--color-warn)',
      },
      borderRadius: { DEFAULT: 'var(--radius)' },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      spacing: { section: 'var(--section-y)' },
    },
  },
  plugins: [],
};
