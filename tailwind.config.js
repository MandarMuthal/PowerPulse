/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        iron: {
          100: '#f2f2f0',
          200: '#d4d4d8',
          300: '#b4b4ba',
          400: '#8e8e95',
          600: '#3b3b3f',
          700: '#2b2b2e',
          800: '#1f1f21',
          900: '#171718',
          950: '#0f0f10',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        draw: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        draw: 'draw 2.4s ease-out 0.3s forwards',
      },
    },
  },
  plugins: [],
};
