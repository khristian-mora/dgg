/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          50: '#f4f5f1',
          100: '#e5e8de',
          200: '#ccd3bc',
          300: '#a8b48f',
          400: '#849265',
          500: '#68774c',
          600: '#515e3c',
          700: '#414b32',
          800: '#363d2b',
          900: '#2f3428',
          950: '#181b14',
        },
        gold: {
          50: '#fdfbe9',
          100: '#fbf5c6',
          200: '#f6e98d',
          300: '#f0d44e',
          400: '#eabf24',
          500: '#d5a115',
          600: '#b87b0f',
          700: '#92580f',
          800: '#784613',
          900: '#673b16',
          950: '#3c1e08',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
