/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0D47A1',
        'brand-secondary': '#42A5F5',
        'brand-dark': '#1976D2',
      }
    },
  },
  plugins: [],
}