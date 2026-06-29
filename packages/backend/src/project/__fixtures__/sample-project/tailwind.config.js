/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0a0a0a',
        accent: '#3b82f6',
        border: '#1a1a1a',
        text: '#fafafa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        gutter: '16px',
      },
      borderRadius: {
        card: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
