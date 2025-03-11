module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  content: [
    './src/pages/**/*.{js, ts, jsx, tsx}',
    './src/components/**/*.{js, ts, jsx, tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ieee-blue': '#00629B',
        'ieee-orange': '#FF6A39',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
