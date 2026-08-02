/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d6fe',
          300: '#a4bcfd',
          400: '#7a97fb',
          500: '#5364f7',
          600: '#3b43ee',
          700: '#2d30d9',
          800: '#2729b0',
          900: '#24278c',
          950: '#151654',
        },
        cyber: {
          black: '#07090e',
          darker: '#0c0f17',
          dark: '#121824',
          card: 'rgba(18, 24, 36, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: '#00f2fe',
          purple: '#7928ca',
          pink: '#ff0080',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, rgba(83, 100, 247, 0.15) 0%, rgba(121, 40, 202, 0.15) 50%, rgba(255, 0, 128, 0.15) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'glass-gradient-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 244, 255, 0.6) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.35)',
        'glow-purple': '0 0 20px rgba(121, 40, 202, 0.35)',
        'glow-brand': '0 0 25px rgba(83, 100, 247, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(83, 100, 247, 0.5))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 20px rgba(83, 100, 247, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}
