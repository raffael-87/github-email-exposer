/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        backgroundDark: "#242424",
        fontColorBright: 'rgba(255, 255, 255, 0.87)',
      },
      fontSize: {
        "1px": "1px",
      },
    },
  },
  plugins: [],
};
