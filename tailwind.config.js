/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: { DEFAULT: '#63B22C', deep: '#2F7D1F', soft: '#EAF5E1' },
        ink: { DEFAULT: '#15200E', soft: '#5C6B52' },
        sun: '#FFD43B',
        wash: '#F6F9F2',
        line: '#DDE7D3',
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'Hind Siliguri', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
