/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f4',
          100: '#fbe5ea',
          200: '#f7c8d5',
          300: '#f09db3',
          400: '#e6688a',
          500: '#b8003f',
          600: '#6b0023',
          700: '#55001c',
          800: '#420016',
          900: '#340011',
          950: '#1f000a',
        },
        secondary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9b8',
          400: '#ec7991',
          500: '#a3324a',
          600: '#8b2a40',
          700: '#732236',
          800: '#5c1b2b',
          900: '#451421',
          950: '#2d0c15',
        },
        darkbg: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1d21',
        },
        // Anime-inspired accent colors
        sakura: {
          100: '#ffe4ec',
          200: '#ffc8d9',
          300: '#ffadc6',
          400: '#ff8bb0',
          500: '#ff6b9d',
        },
        lavender: {
          100: '#f0e6ff',
          200: '#dccfff',
          300: '#c4b0ff',
          400: '#a88bff',
          500: '#8b5cf6',
        },
        mint: {
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
        },
        // Softer background colors for better eye comfort
        softbg: {
          50: '#fafbfc',
          100: '#f2f6f3',
          200: '#e8f0ea',
          300: '#d4e6d7',
          400: '#b8d4bc',
          500: '#94c198',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-light': 'bounce 1s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'wiggle': 'wiggle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      }
    },
  },
  plugins: [],
}
