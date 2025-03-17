/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          600: '#57ba3c',
          700: '#4ca535',
        },
        blue: {
          50: '#f0f7fe',
          100: '#e1effe',
          500: '#1583e3',
          600: '#1583e3',
          700: '#1376cc',
        },
      },
    },
  },
  plugins: [],
};