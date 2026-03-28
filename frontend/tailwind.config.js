/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand navy — the hero colour
        primary: {
          50:  '#eef3f7',
          100: '#d5e2eb',
          200: '#aac4d7',
          300: '#7ea7c3',
          400: '#5389af',
          500: '#3a6d96',
          600: '#2C4C64', // brand navy
          700: '#243f54',
          800: '#1c3243',
          900: '#142433',
        },
        // Warm gold accent
        gold: {
          50:  '#fdf8ec',
          100: '#f9edc8',
          200: '#f3d98e',
          300: '#ecc255',
          400: '#D4A045', // brand gold
          500: '#b8872e',
          600: '#9a6e1f',
        },
        // Blush — soft feminine accent
        blush: {
          50:  '#fdf4f4',
          100: '#fae5e7',
          200: '#f5cdd0',
          300: '#eeadb2',
          400: '#e48890',
          500: '#d4606b',
          600: '#b84856',
        },
        // Warm cream backgrounds
        warm: {
          50:  '#fef9f5',
          100: '#fdf1e7',
          200: '#fbe5d3',
          300: '#f8d5bb',
        },
      },
      fontFamily: {
        sans:    ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'xs':     '0 1px 4px 0 rgba(44, 76, 100, 0.06)',
        'soft':   '0 2px 16px -4px rgba(44, 76, 100, 0.10), 0 4px 8px -2px rgba(44, 76, 100, 0.06)',
        'card':   '0 4px 24px -6px rgba(44, 76, 100, 0.12), 0 8px 16px -4px rgba(44, 76, 100, 0.07)',
        'hover':  '0 12px 40px -8px rgba(44, 76, 100, 0.18), 0 4px 16px -4px rgba(44, 76, 100, 0.10)',
        'gold':   '0 4px 20px -4px rgba(212, 160, 69, 0.30)',
        'inset':  'inset 0 2px 8px 0 rgba(44, 76, 100, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out both',
        'slide-up':    'slideUp 0.5s ease-out both',
        'slide-down':  'slideDown 0.3s ease-out both',
        'float':       'float 4s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition:  '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'noise':              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
