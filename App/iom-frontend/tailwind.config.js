/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primaryTeal: "#6AF1E3",
        secondaryGray: "#D9D9D9",
        fontBlack: "#000000", // Ensure this exists
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        subheading: ["Montserrat", "sans-serif"],
        paragraph: ["Roboto", "sans-serif"],
      },
      underlineOffset: {
        8: "8px",
      },
    },
  },
  plugins: [],
};
