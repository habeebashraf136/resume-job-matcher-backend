/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        yellow: 'var(--yellow)',
        cyan: 'var(--cyan)',
        pink: 'var(--pink)',
        purple: 'var(--purple)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        
        btnText: '#111111',
        shadowColor: 'var(--shadow-color)',
        
        /* Legacy mappings to prevent breaks */
        background: 'var(--bg)',
        foreground: 'var(--ink)',
        card: 'var(--surface)',
        primary: {
          DEFAULT: 'var(--cyan)',
          foreground: '#111111',
        },
        secondary: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--ink)',
        },
        accent: {
          DEFAULT: 'var(--pink)',
          foreground: '#111111',
        },
        warning: {
          DEFAULT: 'var(--yellow)',
          foreground: '#111111',
        },
        muted: {
          DEFAULT: 'var(--surface)',
          foreground: '#444444',
        },
        border: 'var(--ink)',
      },
      boxShadow: {
        'neo': '4px 4px 0 var(--shadow-color)',
        'neo-sm': '3px 3px 0 var(--shadow-color)',
        'neo-lg': '8px 8px 0 var(--shadow-color)',
      },
      borderRadius: {
        'neo': '6px',
        'pill': '9999px',
        'circle': '50%',
      },
      animation: {
        'stripe': 'stripe 1s linear infinite',
      },
      keyframes: {
        stripe: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        }
      }
    },
  },
  plugins: [],
}
