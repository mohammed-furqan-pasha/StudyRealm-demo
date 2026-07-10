import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        coral: {
          400: '#F87171',
          500: '#EF4444',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'star-pop': 'starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        starPop: { '0%': { transform: 'scale(0) rotate(-10deg)' }, '100%': { transform: 'scale(1) rotate(0deg)' } },
        pulseDot: { '0%,100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(45,212,191,0.4)' }, '50%': { transform: 'scale(1.1)', boxShadow: '0 0 0 8px rgba(45,212,191,0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
export default config;
