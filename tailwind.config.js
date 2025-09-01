/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          25: '#fefefe',
          50: '#fefefe',
          100: '#fefcf8',
          200: '#fdf8f0',
          300: '#fbf0e0',
          400: '#f7e4c4',
          500: '#f0d4a3',
          600: '#e6c085',
          700: '#d4a65f',
          800: '#c08f4a',
          900: '#9e733f',
        },
        soft: {
          purple: '#e9d5ff',
          pink: '#fce7f3',
          lavender: '#f3e8ff',
        }
      }
    },
  },
  plugins: [],
}
