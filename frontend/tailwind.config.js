/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          light: '#334155',
          dark: '#020617',
        },
        dark: {
          950: '#050608',
          900: '#08090b',
          850: '#0e1014',
          800: '#181b22',
          750: '#22252c',
          700: '#2a2d36',
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        reading: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        brand: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        code: ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
