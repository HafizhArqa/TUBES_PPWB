/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          primary: '#4338F5',
          primaryHover: '#3730E8',
          secondary: '#6366F1',
          bg: '#F4F5FA',
          card: '#FFFFFF',
          textMain: '#20243A',
          textMuted: '#9298AA',
          success: '#24C9A0',
          danger: '#F16D83',
          border: '#ECEEF4',
          cyan: '#16DBCC',
          orange: '#FC7900',
          magenta: '#FA00FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
      },
      boxShadow: {
        'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.025)',
        'soft-hover': '0 8px 25px 0 rgba(67, 56, 245, 0.06)',
      },
    },
  },
  plugins: [],
};
