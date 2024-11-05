// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'aribau': ['"Aribau Rounded"', 'sans-serif'], // Adding your custom font
      },
      colors: {
        customBackground: '#080511', // Custom background color example
        customTextColor: '#9F9BAE', // Example custom text color
      },
    },
  },
  plugins: [],
}
