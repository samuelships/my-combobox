import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1.0)' },
        },
        slideUpAndFade: {
          from: { opacity: '1', transform: 'translateY(0) scale(1.0)' },
          to: { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
        },

      },
      animation: {
        slideDownAndFade: 'slideDownAndFade 100ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 100ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],

}
export default config
