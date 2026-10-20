import type { Config } from 'tailwindcss';
export default { content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'], theme: { extend: { colors: { dopamine: '#ff008c', lime: '#c7ff00', paper: '#f8f7f2' } } }, plugins: [] } satisfies Config;
