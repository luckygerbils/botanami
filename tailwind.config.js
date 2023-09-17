/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const colors = require('tailwindcss/colors')
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark": {
          ...colors.zinc,
          DEFAULT: colors.zinc[900],
        },
        "light": colors.zinc[50],
      },
    }
  },
  variants: {},
  plugins: [],
};
