/** Tailwind bound to the active design system via CSS variables (src/index.css imports its tokens.css). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}', './design-systems/**/code/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-dark': 'var(--color-surface-dark)',
        'surface-hover': 'var(--color-surface-hover)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverse': 'var(--color-text-inverse)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-muted': 'var(--color-accent-muted)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        success: 'var(--color-success)',
        warn: 'var(--color-warn)',
        danger: 'var(--color-danger)',
      },
      borderRadius: { DEFAULT: 'var(--radius)', sm: 'var(--radius-sm)', full: 'var(--radius-full)' },
    },
  },
  plugins: [],
};
