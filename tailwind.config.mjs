/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#f4f3ee',
        surface: '#ffffff',
        ink: '#1a1915',
        muted: '#6c6a60',
        line: '#e6e3d9',
        accent: '#b5654a',
        accentInk: '#8c4830',
        forest: '#1f2a24',
        sage: '#7b8b6f'
      },
      fontFamily: {
        display: ['IBM Plex Sans KR', 'sans-serif'],
        body: ['IBM Plex Sans KR', 'sans-serif'],
        latin: ['Manrope', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif']
      },
      borderRadius: {
        DEFAULT: '16px',
        lg: '22px'
      },
      boxShadow: {
        soft: '0 20px 50px -28px rgba(31, 42, 36, 0.42)'
      }
    }
  },
  plugins: []
};
