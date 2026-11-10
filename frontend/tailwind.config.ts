import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#02040a',
          900: '#050914',
          850: '#081021',
          800: '#0c162d',
        },
        nexora: {
          deep: '#0a1f44',
          navy: '#102a5c',
          royal: '#1d4ed8',
          bright: '#3b82f6',
          ice: '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(14px, -16px) scale(1.05)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
