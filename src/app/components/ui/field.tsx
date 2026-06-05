import React from "react";

/** Shared control styling for inputs, selects and textareas. */
export const controlClasses =
    "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50";

export const labelClasses =
    "block text-xs font-medium uppercase tracking-wide text-muted mb-1";

export const Label = ({
    className = "",
    ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className={`${labelClasses} ${className}`.trim()} {...props} />
);

export const Input = ({
    className = "",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className={`${controlClasses} ${className}`.trim()} {...props} />
);

export const Select = ({
    className = "",
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select className={`${controlClasses} ${className}`.trim()} {...props}>
        {children}
    </select>
);

export const Textarea = ({
    className = "",
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea className={`${controlClasses} ${className}`.trim()} {...props} />
);

/** Label + control wrapper for consistent vertical form rhythm. */
export const Field = ({
    label,
    htmlFor,
    children,
    className = "",
}: {
    label: React.ReactNode;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={`flex flex-col ${className}`.trim()}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
    </div>
);
