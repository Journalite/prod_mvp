const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx,css}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                'brand-blue': {
                    50: '#eef5ff',
                    100: '#d9e7ff',
                    200: '#bcd4ff',
                    300: '#8fb7ff',
                    400: '#608fff',
                    500: '#3a66ff',
                    600: '#1a3ff7',
                    700: '#132ee6',
                    800: '#1627bf',
                    900: '#172495',
                },
                slate: colors.slate,
                gray: colors.gray,
            },
            boxShadow: {
                'lg-blue': '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
} 