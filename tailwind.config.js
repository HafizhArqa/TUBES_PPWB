/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        tera: {
          navy: '#071536',
          navyHover: '#0f2452',
          navyCard: '#0c1a3b',
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          accent: '#1d68e1',
          bgAdmin: '#f4f6fa',
          bgPortal: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

