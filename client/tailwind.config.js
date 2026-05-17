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
            keyframes: {
                slideIn: {
                    from: { opacity: '0', transform: 'translateY(-8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                slideIn: 'slideIn 0.3s ease',
            },
        },
    },
    plugins: [],
}
