import React from "react";

const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

export const Spinner = ({
    size = "md",
    label = "Loading",
    className = "",
}: {
    size?: keyof typeof sizes;
    label?: string;
    className?: string;
}) => (
    <span role="status" className={`inline-flex ${className}`.trim()}>
        <svg
            aria-hidden="true"
            className={`${sizes[size]} animate-spin text-subtle`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
        </svg>
        <span className="sr-only">{label}</span>
    </span>
);
