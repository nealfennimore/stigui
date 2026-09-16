import type { Config } from 'tailwindcss';

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                canvas: withAlpha('--canvas'),
                surface: {
                    DEFAULT: withAlpha('--surface'),
                    muted: withAlpha('--surface-muted'),
                },
                foreground: withAlpha('--foreground'),
                muted: withAlpha('--muted'),
                subtle: withAlpha('--subtle'),
                border: {
                    DEFAULT: withAlpha('--border'),
                    strong: withAlpha('--border-strong'),
                },
                accent: {
                    DEFAULT: withAlpha('--accent'),
                    hover: withAlpha('--accent-hover'),
                    foreground: withAlpha('--accent-foreground'),
                    subtle: withAlpha('--accent-subtle'),
                },
                ring: withAlpha('--ring'),
                ...Object.fromEntries(
                    [
                        'danger',
                        'warning',
                        'caution',
                        'info',
                        'success',
                        'neutral',
                        'contrast',
                    ].map((tone) => [
                        tone,
                        {
                            DEFAULT: withAlpha(`--${tone}-solid`),
                            surface: withAlpha(`--${tone}-surface`),
                            foreground: withAlpha(`--${tone}-foreground`),
                            ring: withAlpha(`--${tone}-ring`),
                            'solid-foreground': withAlpha(
                                `--${tone}-solid-foreground`
                            ),
                        },
                    ])
                ),
            },
            borderColor: {
                DEFAULT: withAlpha('--border'),
            },
            boxShadow: {
                card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
                overlay: 'var(--shadow-overlay)',
            },
        },
    },
    plugins: [],
} satisfies Config;
