/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: '#F8F1E7',
        ink: '#241C18',
        clay: '#B46A55',
        rosewood: '#6F2E2E',
        sage: '#7B8B6F',
        pearl: '#FFFDFC'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Noto Sans KR', 'sans-serif']
      },
      boxShadow: {
        soft: '0 24px 80px rgba(111, 46, 46, 0.16)'
      }
    }
  },
  plugins: []
};
