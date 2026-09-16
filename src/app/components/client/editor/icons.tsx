import React from "react";

type IconProps = { className?: string };

const Svg = ({
    className = "w-4 h-4",
    children,
}: IconProps & { children: React.ReactNode }) => (
    <svg
        aria-hidden="true"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
    >
        {children}
    </svg>
);

/** 24-grid stroke icons for the workbench (Lucide geometry). */
export const Icon = {
    library: (p: IconProps) => (
        <Svg {...p}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </Svg>
    ),
    checklists: (p: IconProps) => (
        <Svg {...p}>
            <path d="m9 11 3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </Svg>
    ),
    workbench: (p: IconProps) => (
        <Svg {...p}>
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
        </Svg>
    ),
    transfer: (p: IconProps) => (
        <Svg {...p}>
            <path d="m21 16-4 4-4-4" />
            <path d="M17 20V4" />
            <path d="m3 8 4-4 4 4" />
            <path d="M7 4v16" />
        </Svg>
    ),
    upload: (p: IconProps) => (
        <Svg {...p}>
            <path d="M12 3v12" />
            <path d="m17 8-5-5-5 5" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </Svg>
    ),
    download: (p: IconProps) => (
        <Svg {...p}>
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </Svg>
    ),
    search: (p: IconProps) => (
        <Svg {...p}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </Svg>
    ),
    plus: (p: IconProps) => (
        <Svg {...p}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </Svg>
    ),
    trash: (p: IconProps) => (
        <Svg {...p}>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </Svg>
    ),
    metadata: (p: IconProps) => (
        <Svg {...p}>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
        </Svg>
    ),
    chevronLeft: (p: IconProps) => (
        <Svg {...p}>
            <path d="m15 18-6-6 6-6" />
        </Svg>
    ),
    chevronRight: (p: IconProps) => (
        <Svg {...p}>
            <path d="m9 18 6-6-6-6" />
        </Svg>
    ),
    chevronDown: (p: IconProps) => (
        <Svg {...p}>
            <path d="m6 9 6 6 6-6" />
        </Svg>
    ),
    github: (p: IconProps) => (
        <svg
            aria-hidden="true"
            className={p.className ?? "w-4 h-4"}
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
                fillRule="evenodd"
                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                clipRule="evenodd"
            />
        </svg>
    ),
};

export type IconName = keyof typeof Icon;
