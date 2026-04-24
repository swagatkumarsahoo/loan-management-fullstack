/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink:   { DEFAULT: '#0D0F14', 50: '#F5F6F8', 100: '#E8EAF0', 200: '#C9CEDB', 300: '#9AA2B8', 400: '#6B7592', 500: '#4A5470', 600: '#333B55', 700: '#222840', 800: '#161C30', 900: '#0D0F14' },
        jade:  { DEFAULT: '#00C37A', 50: '#E6FFF4', 100: '#BDFEE3', 200: '#7AF8C3', 300: '#2FE89A', 400: '#00C37A', 500: '#00A065', 600: '#007C50', 700: '#005A3A', 800: '#003B26', 900: '#001D12' },
        amber: { DEFAULT: '#F5A623', 50: '#FFF8EC', 100: '#FEECC8', 200: '#FDD48A', 300: '#FBB947', 400: '#F5A623', 500: '#D98A0D', 600: '#B57009', 700: '#8C5407', 800: '#613A05', 900: '#371F02' },
        rose:  { DEFAULT: '#FF4D6D', 50: '#FFF0F3', 100: '#FFD6DE', 200: '#FFA3B3', 300: '#FF7089', 400: '#FF4D6D', 500: '#E6284F', 600: '#BF1638', 700: '#8F0E28', 800: '#5E081A', 900: '#30040D' },
        sky:   { DEFAULT: '#3B9EFF', 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B9EFF', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A' },
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        'card':  '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'glow':  '0 0 40px rgba(0,195,122,0.15)',
        'glow-sm': '0 0 20px rgba(0,195,122,0.10)',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: { 'dot': '28px 28px' },
      animation: {
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-up':  'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    }
  },
  plugins: []
}
