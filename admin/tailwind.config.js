/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#242a33',
        muted: '#78808b',
        line: '#e8e5df',
        paper: '#fffefa',
        canvas: '#f7f6f2',
        peach: '#f8e6de',
        rose: '#c4b5fd',
        'rose-dark': '#a78bfa',
        green: '#4b9b72',
        amber: '#d98a3d',
        blue: '#8aa4c4',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  // Tailwind CSS v4 compatible - no plugins needed for core
}