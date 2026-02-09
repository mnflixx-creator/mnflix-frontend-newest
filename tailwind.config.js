/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mnflix_blue: "#0A1A2F",        // your dark blue
        mnflix_light_blue: "#1E90FF", // your neon blue
        mnflix_gray: "#A0AEC0",
        primary: '#e50914',
        secondary: '#221f1f',
        background: '#141414',
      },
    },
  },
  plugins: [],
}
