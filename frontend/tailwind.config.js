/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft World — warm charcoal text
        ink: {
          50:  '#f5f4f3',
          100: '#e8e6e3',
          200: '#d1cdc8',
          300: '#b0aaa3',
          400: '#8a827a',
          500: '#6b635b',
          600: '#4a443e',
          700: '#3a3530',
          800: '#2D2A26', // primary text
          900: '#1e1c19',
        },
        // Terracotta rose — primary accent
        rose: {
          50:  '#fdf5f4',
          100: '#fae8e6',
          200: '#f4cdc9',
          300: '#e8aaa4',
          400: '#C4756E', // primary accent
          500: '#a85d56',
          600: '#8c4940',
        },
        // Sage green — secondary accent
        sage: {
          50:  '#f4f7f4',
          100: '#e5ece5',
          200: '#c9d8c8',
          300: '#a5bda3',
          400: '#8BA88A', // secondary accent
          500: '#6d8d6b',
          600: '#547254',
        },
        // Dusty gold — tertiary / premium
        gold: {
          50:  '#faf7f0',
          100: '#f2ecdb',
          200: '#e3d5b4',
          300: '#d4be8d',
          400: '#C9A96E', // tertiary accent
          500: '#a8894e',
          600: '#8a6e38',
        },
        // Parchment — warm backgrounds (never pure white)
        parchment: {
          50:  '#FFFDF9',
          100: '#FDF6EC', // main bg
          200: '#F8EDDA',
          300: '#F0E0C6',
        },
        // Keep legacy primary for transition
        primary: {
          50:  '#f5f4f3',
          100: '#e8e6e3',
          200: '#d1cdc8',
          300: '#b0aaa3',
          400: '#8a827a',
          500: '#6b635b',
          600: '#2D2A26',
          700: '#3a3530',
          800: '#2D2A26',
          900: '#1e1c19',
        },
        // Legacy warm mapping → parchment
        warm: {
          50:  '#FFFDF9',
          100: '#FDF6EC',
          200: '#F8EDDA',
          300: '#F0E0C6',
        },
      },
      fontFamily: {
        serif:    ['Fraunces', 'Georgia', 'serif'],
        sans:     ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        hand:     ['Caveat', 'cursive'],
      },
      fontSize: {
        // Consistent type scale
        'display-xl': ['clamp(2.75rem, 7vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display':    ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading':    ['clamp(1.5rem, 3.5vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subheading': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body':       ['0.9375rem', { lineHeight: '1.65' }],
        'body-sm':    ['0.8125rem', { lineHeight: '1.6' }],
        'caption':    ['0.75rem', { lineHeight: '1.5' }],
        'label':      ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      boxShadow: {
        'xs':     '0 1px 3px 0 rgba(45, 42, 38, 0.04)',
        'soft':   '0 2px 12px -3px rgba(45, 42, 38, 0.08)',
        'card':   '0 4px 20px -4px rgba(45, 42, 38, 0.10)',
        'hover':  '0 8px 32px -6px rgba(45, 42, 38, 0.14)',
        'glow':   '0 4px 20px -4px rgba(196, 117, 110, 0.25)',
        'inset':  'inset 0 2px 6px 0 rgba(45, 42, 38, 0.05)',
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.6s ease-out both',
        'slide-up':    'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down':  'slideDown 0.35s ease-out both',
        'float':       'float 5s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
