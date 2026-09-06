/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  // Dark mode is variable-driven: tokens.css flips the --color-* values under
  // :root[data-theme="dark"], and every color below points at those variables,
  // so utilities update automatically when the theme attribute changes. No
  // `dark:` variants are needed. This keeps the palette monochrome and central.
  theme: {
    extend: {
      colors: {
        page: 'var(--color-page)',
        surface: 'var(--color-surface)',
        hairline: 'var(--color-hairline)',
        tertiary: 'var(--color-text-tertiary)',
        secondary: 'var(--color-text-secondary)',
        primary: 'var(--color-text-primary)',
      },
      fontFamily: {
        sans: [
          '"Hanken Grotesk"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
      },
      maxWidth: {
        container: '1440px',
        prose: '820px',
      },
      letterSpacing: {
        hero: '-0.025em',
        title: '-0.02em',
      },
    },
  },
  plugins: [],
};
