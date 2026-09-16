import React from "react";
import { Spinner } from "@/app/components/ui/spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
    primary:
        "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm disabled:hover:bg-accent",
    secondary:
        "bg-surface text-foreground border border-border-strong hover:bg-surface-muted disabled:hover:bg-surface",
    ghost: "bg-transparent text-muted hover:bg-surface-muted hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-muted",
    danger: "bg-danger text-danger-solid-foreground hover:bg-danger/90 shadow-sm disabled:hover:bg-danger",
};

const sizes: Record<ButtonSize, string> = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
};

export const buttonClasses = ({
    variant = "secondary",
    size = "md",
    className = "",
}: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
} = {}) => `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
};

export const Button = ({
    variant = "secondary",
    size = "md",
    className = "",
    type = "button",
    loading = false,
    disabled,
    children,
    ...props
}: ButtonProps) => (
    <button
        type={type}
        className={buttonClasses({ variant, size, className })}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
    >
        {loading && <Spinner size="sm" label="Working" />}
        {children}
    </button>
);
