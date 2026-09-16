import React from "react";

export type BadgeTone =
    | "danger"
    | "warning"
    | "caution"
    | "info"
    | "success"
    | "neutral"
    | "contrast";

const tones: Record<BadgeTone, string> = {
    danger: "bg-danger-surface text-danger-foreground",
    warning: "bg-warning-surface text-warning-foreground",
    caution: "bg-caution-surface text-caution-foreground",
    info: "bg-info-surface text-info-foreground",
    success: "bg-success-surface text-success-foreground",
    neutral: "bg-neutral-surface text-neutral-foreground",
    contrast:
        "bg-contrast-surface text-contrast-foreground dark:border dark:border-white/40",
};

const selectedRings: Record<BadgeTone, string> = {
    danger: "ring-2 ring-danger-ring",
    warning: "ring-2 ring-warning-ring",
    caution: "ring-2 ring-caution-ring",
    info: "ring-2 ring-info-ring",
    success: "ring-2 ring-success-ring",
    neutral: "ring-2 ring-neutral-ring",
    contrast: "ring-2 ring-contrast-ring",
};

/**
 * Badge is margin-free; callers own layout gaps (use flex `gap-*`).
 * With `onClick` it renders a real button with `aria-pressed`; without,
 * an inert span.
 */
export const badgeClasses = ({
    tone,
    selected = false,
    interactive = false,
    className = "",
}: {
    tone: BadgeTone;
    selected?: boolean;
    interactive?: boolean;
    className?: string;
}) =>
    [
        "inline-flex items-center text-sm max-sm:text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap transition-shadow",
        tones[tone],
        selected ? selectedRings[tone] : "",
        interactive ? "cursor-pointer" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

export const Badge = ({
    tone,
    children,
    count,
    selected = false,
    onClick,
    className = "",
}: {
    tone: BadgeTone;
    children: React.ReactNode;
    count?: number;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}) => {
    const content = (
        <>
            <span>{children}</span>
            {!isNaN(Number(count)) && (
                <span className="text-xs ml-1.5 opacity-70">{count}</span>
            )}
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                aria-pressed={selected}
                className={badgeClasses({
                    tone,
                    selected,
                    interactive: true,
                    className,
                })}
                onClick={onClick}
            >
                {content}
            </button>
        );
    }

    return (
        <span className={badgeClasses({ tone, selected, className })}>
            {content}
        </span>
    );
};
