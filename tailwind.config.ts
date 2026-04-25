import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                rose: { DEFAULT: '#DF909E', soft: 'rgba(223,144,158,0.12)' },
                mint: { DEFAULT: '#93D8C3', soft: 'rgba(147,216,195,0.15)', dark: '#5aab93' },
                tangerine: { DEFAULT: '#F1943F', dark: '#e0850e' },
                slate: { DEFAULT: '#5B8496', deep: '#3d5f6e' },
                cream: '#FBF8F4',
            },
            fontFamily: {
                display: ['"Fraunces"', 'serif'],
                body: ['"Nunito"', 'sans-serif'],
            },
            borderRadius: {
                pill: '50px',
                card: '20px',
                icon: '14px',
            },
            boxShadow: {
                card: '0 4px 16px rgba(91,132,150,0.05)',
                'card-hover': '0 12px 40px rgba(91,132,150,0.1)',
                nav: '0 4px 24px rgba(91,132,150,0.08)',
                'btn-primary': '0 6px 24px rgba(241,148,63,0.25)',
                'btn-primary-hover': '0 8px 32px rgba(241,148,63,0.35)',
            },
        },
    },
    plugins: [],
} satisfies Config;
