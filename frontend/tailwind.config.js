export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FDF2F7',
          100: '#FCE7F0',
          200: '#FAC4D8',
          300: '#F692B7',
          400: '#EB5092',
          500: '#EB0373',
          600: '#CC0264',
          700: '#AA024D',
          800: '#86013D',
          900: '#620131',
          950: '#3D001E',
        },
        accent: {
          50:  '#E6FBFD',
          100: '#B3F5FA',
          200: '#80EFF7',
          300: '#4DE9F4',
          400: '#1AE3F1',
          500: '#01DFEA',
          600: '#01B2BA',
          700: '#01858B',
          800: '#01595C',
          900: '#002C2E',
        },
        ink:      '#0A0D12',
        surface:  '#FFFFFF',
        muted:    '#F4F5F6',
        border:   '#E5E7EB',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display':    ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700'  }],
        'heading-xl': ['2rem',   { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '600'  }],
        'heading-lg': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '600' }],
        'heading':    ['1.25rem',{ lineHeight: '1.3',  fontWeight: '600'  }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(10, 13, 18, 0.04), 0 4px 12px rgba(10, 13, 18, 0.04)',
        'card-h': '0 2px 6px rgba(10, 13, 18, 0.06), 0 8px 24px rgba(10, 13, 18, 0.06)',
        'nav':    '0 1px 0 rgba(10, 13, 18, 0.06)',
        'modal':  '0 0 0 1px rgba(10, 13, 18, 0.06), 0 8px 32px rgba(10, 13, 18, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'float':   'float 6s ease-in-out infinite',
        'glow':    'glow 3s ease-in-out infinite',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}