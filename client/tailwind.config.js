/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                accent: {
                    DEFAULT: '#2563eb',
                    hover: '#1d4ed8',
                },
            },
            borderRadius: {
                DEFAULT: '8px',
            },
        },
    },
    plugins: [],
}
