/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rail: {
          night: '#0F1F38',
          nightlight: '#1B3358',
          platform: '#F7F5F0',
          amber: '#D98E2B',
          amberdark: '#B9761D',
          charcoal: '#1F2937',
          muted: '#6B7280',
          confirmed: '#2F7D5C',
          alert: '#B3261E',
          line: '#E4DFD3',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
