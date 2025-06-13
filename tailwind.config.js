/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED', 
        accent: '#10B981',
        surface: '#F8FAFC',
        background: '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      fontFamily: { 
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], 
        heading: ['DM Sans', 'ui-sans-serif', 'system-ui'] 
      },
      animation: {
        'count-up': 'count-up 0.8s ease-out',
        'progress-fill': 'progress-fill 1s ease-out'
      },
      keyframes: {
        'count-up': {
          '0%': { opacity: '0.5', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'progress-fill': {
          '0%': { strokeDasharray: '0 100' },
          '100%': { strokeDasharray: 'var(--progress) 100' }
        }
      }
    },
  },
  plugins: [],
}