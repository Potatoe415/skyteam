/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cockpit: {
          bg: '#0b3a52',
          panel: '#9aa6ac',
          panelDark: '#7c8890',
          steel: '#b9c2c7',
        },
        steel: {
          light: '#aeb9c0',
          DEFAULT: '#8b98a1',
          dark: '#5f6d77',
          bezel: '#39444c',
          ink: '#1d272d',
        },
        pilot: {
          DEFAULT: '#1f7fe0',
          light: '#3a9bef',
          dark: '#14538f',
        },
        copilot: {
          DEFAULT: '#f08a1d',
          light: '#ffa53d',
          dark: '#b5610c',
        },
        sky: {
          top: '#3fb1f0',
          mid: '#1ea0e6',
        },
      },
      fontFamily: {
        cockpit: ['Verdana', 'Geneva', 'sans-serif'],
      },
      boxShadow: {
        slot: 'inset 0 2px 6px rgba(0,0,0,0.55)',
        die: '0 2px 3px rgba(0,0,0,0.45)',
        board: '0 10px 30px rgba(0,0,0,0.45)',
        bezel: 'inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 8px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
