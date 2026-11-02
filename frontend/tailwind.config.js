/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0D0C",
        navbar: "#101614",
        cards: "#121A17",
        hover: "#18231F",
        borderDark: "#26352F",
        primary: {
          DEFAULT: "#00C896",
          hover: "#00b284",
          light: "#2de0b2"
        },
        secondary: "#A3E635",
        warning: "#F5B942",
        textLight: "#F3F7F5",
        muted: "#9AAEA5"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
