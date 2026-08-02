import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#111827',
          accent: '#d4a373',
        },
      },
    },
  },
  plugins: [],
};
export default config;
