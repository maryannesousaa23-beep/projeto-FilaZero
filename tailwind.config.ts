import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink:'#14213d', brand:'#2457e6', mint:'#dff7ef', canvas:'#f5f7fb' }, boxShadow: { soft:'0 12px 35px rgba(20,33,61,.07)' } } }, plugins: [] };
export default config;
