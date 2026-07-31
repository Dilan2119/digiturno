/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      touchAction: {
        none: 'none',
      },
    },
  },
  plugins: [],
}
