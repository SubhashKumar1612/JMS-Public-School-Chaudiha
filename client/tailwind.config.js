/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#1a73e8",
          700: "#0c4fa8",
          900: "#072f64"
        }
      },
      boxShadow: { soft: "0 10px 25px rgba(15, 40, 82, 0.12)" },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Open Sans", "sans-serif"]
      }
    }
  },
  plugins: []
};
