/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#137fec",
                "primary-50": "#eff6ff",
                "primary-100": "#dbeafe",
                "primary-200": "#bfdbfe",
                "primary-300": "#93c5fd",
                "primary-400": "#60a5fa",
                "primary-500": "#137fec", // Base
                "primary-600": "#2563eb",
                "primary-700": "#1d4ed8",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "neutral-surface": "#ffffff",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"]
            },
            // Animações customizadas dos templates (se houver)
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
