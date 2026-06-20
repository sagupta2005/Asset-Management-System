/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#8b5cf6', // Premium Electric Purple/Violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        cyber: {
          teal: '#06b6d4',
          cyan: '#22d3ee',
          pink: '#ec4899',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          emerald: '#10b981',
          slate: '#0f172a',
          dark: '#070a13',
          surface: '#0f1626',
        }
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card:  '0 4px 20px -2px rgba(0,0,0,0.1), 0 2px 8px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 20px 40px -10px rgba(124, 58, 237, 0.15), 0 0 20px rgba(6, 182, 212, 0.05)',
        'glow-primary': '0 0 25px rgba(139, 92, 246, 0.45)',
        'glow-success': '0 0 25px rgba(16, 185, 129, 0.45)',
        'glow-cyber': '0 0 30px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideInLeft 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0, transform: 'translateY(8px)' },   to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.95)' },       to: { opacity: 1, transform: 'scale(1)' } },
      },
      spacing: {
        sidebar: '260px',
        topbar: '64px',
      },
    },
  },
  plugins: [],
}
