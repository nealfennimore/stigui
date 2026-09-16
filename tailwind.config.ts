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
                wb: {
                    divider: withAlpha('--wb-divider'),
                    inset: withAlpha('--wb-inset'),
                    text: withAlpha('--wb-text'),
                    body: withAlpha('--wb-body'),
                    faint: withAlpha('--wb-faint'),
                    selected: withAlpha('--wb-selected'),
                    'nav-active': withAlpha('--wb-nav-active'),
                    'nav-active-foreground': withAlpha(
                        '--wb-nav-active-foreground'
                    ),
                    'tip-surface': withAlpha('--wb-tip-surface'),
                    'tip-border': withAlpha('--wb-tip-border'),
                    'tip-foreground': withAlpha('--wb-tip-foreground'),
                    'tip-link': withAlpha('--wb-tip-link'),
                },
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
                'wb-card': '0 1px 2px rgba(20, 30, 45, 0.03)',
                'wb-selected': '0 2px 8px rgba(40, 80, 160, 0.09)',
                'wb-primary': '0 2px 6px rgba(50, 90, 180, 0.25)',
                'wb-open': '0 2px 6px rgba(170, 60, 50, 0.25)',
                'wb-pass': '0 2px 6px rgba(30, 120, 70, 0.22)',
                'wb-neutral': '0 2px 6px rgba(80, 90, 105, 0.22)',
            },
            fontFamily: {
                plex: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
                'plex-mono': [
                    'var(--font-plex-mono)',
                    'ui-monospace',
                    'monospace',
                ],
            },
        },
    },
    plugins: [],
} satisfies Config;
