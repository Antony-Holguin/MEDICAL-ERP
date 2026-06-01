/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/modules/mail/templates/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f99b1f',
        'background-light': '#f8f7f5',
        'background-dark': '#231a0f',
      },
    },
  },
  plugins: [],
};
