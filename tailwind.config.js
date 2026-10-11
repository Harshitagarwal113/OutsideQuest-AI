/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          bg: '#F7F6EF',
          forest: '#315D44',
          'forest-hover': '#264A36',
          'forest-light': '#3E7355',
          sage: '#CBD9C7',
          'sage-light': '#E5ECE3',
          'sage-dark': '#A9BFA4',
          sand: '#E9E0D0',
          'sand-light': '#F4EFE7',
          accent: '#D88D51',
          'accent-hover': '#C3793F',
          charcoal: '#252B25',
          muted: '#5C665C',
          border: '#DCD4C4',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
