/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#137fec',
                'primary-dark': '#0f66bd',
                'background-light': '#f8fafc',
                'background-dark': '#0f172a',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Epilogue', 'sans-serif'],
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
