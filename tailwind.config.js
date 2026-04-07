/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1ea7e1",
          dark: "#0e7fb0",
          light: "#e8f6fd",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial"],
      },
      boxShadow: {
        wall: "0 30px 60px -20px rgba(15, 23, 42, 0.25), 0 15px 30px -15px rgba(15, 23, 42, 0.18)",
      },
      keyframes: {
        flip: {
          "0%": { transform: "rotateX(-90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0)", opacity: "1" },
        },
        fade: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flip: "flip 350ms ease-out",
        fade: "fade 250ms ease-out",
      },
    },
  },
  plugins: [],
};
