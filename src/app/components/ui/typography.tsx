/**
 * Typography and spacing conventions.
 *
 * Use these constants instead of ad-hoc class combinations so text styles
 * stay consistent across screens. Spacing conventions for new layouts:
 * control padding `px-3 py-2` (md) or `px-2.5 py-1.5` (sm), card padding
 * `p-5`, `gap-4` within a section, `gap-6` between sections.
 */
export const typography = {
    h1: "text-2xl font-semibold tracking-tight text-foreground",
    h2: "text-lg font-semibold text-foreground",
    h3: "text-sm font-semibold text-foreground",
    label: "text-xs font-medium uppercase tracking-wide text-muted",
    body: "text-sm text-muted",
    small: "text-xs text-subtle",
    mono: "font-[family-name:var(--font-geist-mono)] text-xs",
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => (
    <h1 className={typography.h1}>{children}</h1>
);
