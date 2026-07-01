/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        royal: {
          ink: '#111827',
          navy: '#172554',
          blue: '#1D4ED8',
          gold: '#B8872B',
          champagne: '#FFF7E6',
          pearl: '#FBF7EF',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        app: { bg: '#F7F3EA', card: '#FFFFFF', text: '#1E293B', border: '#E8DDC8' },
      },
      borderRadius: { xl: '1rem' },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.10)',
        royal: '0 22px 55px rgba(17, 24, 39, 0.16)',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
