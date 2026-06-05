"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Inline script injected before paint to set the initial theme class on
 * <html>, avoiding a flash of the wrong theme on a static export. Kept as a
 * string so it can run synchronously in <head>.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTheme(
            document.documentElement.classList.contains("dark")
                ? "dark"
                : "light"
        );
    }, []);

    const toggle = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        try {
            localStorage.setItem("theme", next);
        } catch {}
        document.documentElement.classList.toggle("dark", next === "dark");
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle color theme"
            title="Toggle color theme"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
        >
            {/* Render a stable placeholder until mounted to avoid hydration mismatch */}
            {mounted && theme === "dark" ? (
                <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
            ) : (
                <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
};
