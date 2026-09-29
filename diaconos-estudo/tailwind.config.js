/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "media",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#0d6b52",
          light: "#12876a",
          dark: "#0a5340",
        },
      },
    },
  },
  plugins: [],
};
