/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0d0d0d',
        node: {
          story: '#7c3aed',
          character: '#db2777',
          storyboard: '#0891b2',
          frame: '#059669',
          animation: '#d97706',
          voice: '#2563eb',
          music: '#7c3aed',
          compile: '#dc2626',
          export: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
