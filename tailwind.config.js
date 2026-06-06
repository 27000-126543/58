/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8F0FB',
          100: '#C7D8F0',
          200: '#95B4E0',
          300: '#6390D0',
          400: '#316CC0',
          500: '#1A4B9E',
          600: '#143A7C',
          700: '#0F2547',
          800: '#0A1A33',
          900: '#060F1F',
          950: '#03070F',
        },
        accent: {
          orange: '#FF6B35',
          teal: '#00D4AA',
          gold: '#FFD166',
          red: '#EF476F',
          purple: '#9B5DE5',
        },
        metal: {
          100: '#E8EEF7',
          200: '#C7D1E0',
          300: '#9BADCC',
          400: '#7A8BA3',
          500: '#5A6B83',
          600: '#3E4C60',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 170, 0.3), 0 0 10px rgba(0, 212, 170, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.6), 0 0 30px rgba(0, 212, 170, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(155, 173, 204, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(155, 173, 204, 0.05) 1px, transparent 1px)",
        'navy-gradient': 'linear-gradient(135deg, #0F2547 0%, #143A7C 50%, #0A1A33 100%)',
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(0, 212, 170, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.4)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
