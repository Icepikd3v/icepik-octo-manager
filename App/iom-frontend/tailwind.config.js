/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primaryTeal: "#d1e59a",
        secondaryGray: "#f6f5ef",
        fontBlack: "#213d32", // Ensure this exists
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
