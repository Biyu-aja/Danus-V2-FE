/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-stroke": {
          "-webkit-text-stroke": "0.45px #1e1e1e",
        },
        ".text-stroke-1": {
          "-webkit-text-stroke-width": "1px",
        },
        ".text-stroke-2": {
          "-webkit-text-stroke-width": "2px",
        },
        ".text-stroke-3": {
          "-webkit-text-stroke-width": "3px",
        },
        ".text-stroke-black": {
          "-webkit-text-stroke-color": "black",
        },
        ".text-stroke-white": {
          "-webkit-text-stroke-color": "white",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
