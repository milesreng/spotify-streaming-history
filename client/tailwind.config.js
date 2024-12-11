/** @type {import('tailwindcss').Config} */
export default {
  content:["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'header': ['Nunito Sans', 'sans'],
        'content': ['Roboto', 'sans']
      }
    },
  },
  plugins: [],
  darkMode: 'selector'
}

