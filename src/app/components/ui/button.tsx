import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
    primary:
        "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm",
    secondary:
        "bg-surface text-foreground border border-border-strong hover:bg-surface-muted",
    ghost: "bg-transparent text-muted hover:bg-surface-muted hover:text-foreground",
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
};

export const Button = ({
    variant = "secondary",
    size = "md",
    className = "",
    type = "button",
    ...props
}: ButtonProps) => (
    <button
        type={type}
        className={buttonClasses({ variant, size, className })}
        {...props}
    />
);
