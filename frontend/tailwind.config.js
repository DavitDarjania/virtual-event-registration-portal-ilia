/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#613c85",
          dark: "#181a31",
          surface: "#1f213e",
          raised: "#272a37",
          border: "#303064",
          pink: "#ff1057"
        }
      },
      borderRadius: {
        tkt: "14px"
      },
      boxShadow: {
        tkt: "0 24px 70px rgba(0, 0, 0, 0.32)"
      }
    }
  },
  plugins: []
};
