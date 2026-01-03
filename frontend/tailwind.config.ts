import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
        success: {
          DEFAULT: '#52c41a',
          dark: '#389e0d',
        },
        warning: {
          DEFAULT: '#faad14',
          dark: '#d48806',
        },
        danger: {
          DEFAULT: '#ff4d4f',
          dark: '#cf1322',
        },
        gavi: {
          critical: '#d32f2f',    // < 25
          stressed: '#f57c00',    // 25-50
          watch: '#fbc02d',       // 50-75
          safe: '#388e3c',        // > 75
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
