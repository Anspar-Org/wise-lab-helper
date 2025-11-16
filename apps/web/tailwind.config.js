/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Palette C: Discovery Lab (default)
      colors: {
        discovery: {
          indigo: '#5C6BC0',
          green: '#66BB6A',
          amber: '#FFA726',
          cyan: '#26C6DA',
          pink: '#EC407A',
          lime: '#9CCC65',
        },
        // Alternative palettes available in theme switcher
        modern: {
          blue: '#4A90E2',
          green: '#7ED321',
          purple: '#9B59B6',
          orange: '#F5A623',
          teal: '#50C7C7',
          gray: '#95A5A6',
        },
        explorer: {
          navy: '#34495E',
          mint: '#1ABC9C',
          coral: '#E74C3C',
          yellow: '#F39C12',
          blue: '#3498DB',
          violet: '#8E44AD',
        },
        // Semantic colors using Discovery Lab palette
        primary: {
          DEFAULT: '#5C6BC0', // indigo
          50: '#E8EAF6',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#3F51B5',
          600: '#3949AB',
          700: '#303F9F',
          800: '#283593',
          900: '#1A237E',
        },
        success: '#66BB6A', // green
        warning: '#FFA726', // amber
        info: '#26C6DA', // cyan
        accent: '#EC407A', // pink
        background: '#FAFAFA',
        surface: '#FFFFFF',
        'text-primary': '#424242',
        'text-secondary': '#757575',
      },
      fontFamily: {
        sans: ['Gill Sans', 'Avenir Next', 'Futura', 'Helvetica Neue', 'sans-serif'],
        // Child-friendly fonts from style guide
        primary: ['Gill Sans', 'Sassoon Primary', 'Futura', 'sans-serif'],
        code: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Age-appropriate sizes from style guide
        'child-xs': '12px',      // Ages 10-11
        'child-sm': '14px',      // Ages 9-10 (primary text)
        'child-base': '16px',    // Buttons (minimum)
        'child-lg': '18px',      // Headers (small)
        'child-xl': '20px',
        'child-2xl': '24px',     // Headers (large)
      },
      lineHeight: {
        'child': '1.618',        // Golden ratio for readability
      },
      spacing: {
        // Touch-friendly spacing
        'touch': '44px',         // Minimum touch target
        'button': '48px',        // Button height
      },
      minHeight: {
        'button': '48px',
        'input': '40px',
        'touch': '44px',
      },
      minWidth: {
        'button': '120px',
      },
      // Console-style layout dimensions
      maxWidth: {
        'console': '1920px',
      },
      maxHeight: {
        'console': '1000px',
      },
      animation: {
        'badge-pop': 'scale-pop 0.3s ease-in-out',
        'slide-up': 'slide-up 0.2s ease-out',
      },
      keyframes: {
        'scale-pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
