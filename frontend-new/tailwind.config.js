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
        white: '#f6f4f3',
        primary: {
          50: '#f9f1f2',
          100: '#f3e4e6',
          200: '#e7c8ce',
          300: '#d6a2ad',
          400: '#c17484',
          500: '#a74a5f',
          600: '#7f1d35',
          700: '#6d182e',
          800: '#581324',
          900: '#420d1a',
          950: '#25070f',
        },
        neutral: {
          50: '#f2f1f0',
          100: '#e8e6e4',
          200: '#d9d5d2',
          300: '#c1bbb7',
          400: '#968f8a',
          500: '#6d6661',
          600: '#514b47',
          700: '#3d3935',
          800: '#2b2927',
          900: '#1a1918',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.28s ease-out',
        'slide-in': 'slideIn 0.28s ease-out',
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
        slideIn: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
