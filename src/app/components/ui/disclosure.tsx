import React from "react";

/**
 * Native <details>/<summary> disclosure. Children stay in the DOM while
 * closed, so form fields inside are still serialized.
 */
export const Disclosure = ({
    summary,
    defaultOpen = false,
    children,
    className = "",
    onToggle,
}: {
    summary: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
    onToggle?: (open: boolean) => void;
}) => (
    <details
        open={defaultOpen}
        onToggle={(event) =>
            onToggle?.((event.target as HTMLDetailsElement).open)
        }
        className={`group rounded-lg border border-border overflow-hidden ${className}`.trim()}
    >
        <summary className="flex items-center justify-between w-full p-5 text-sm font-semibold tracking-wide uppercase text-muted bg-surface-muted hover:text-foreground transition-colors gap-3 cursor-pointer list-none">
            <span>{summary}</span>
            <svg
                className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5 5 1 1 5"
                />
            </svg>
        </summary>
        <div className="border-t border-border bg-surface">{children}</div>
    </details>
);
