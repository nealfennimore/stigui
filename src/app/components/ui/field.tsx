import React from "react";

/** Shared control styling for inputs, selects and textareas. */
export const controlClasses =
    "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60 disabled:bg-surface-muted disabled:text-subtle disabled:cursor-not-allowed aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger-ring/40";

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

/**
 * Label + control wrapper for consistent vertical form rhythm.
 * When `hint` or `error` is set and the child is a single element, the
 * child is cloned with `aria-describedby` (and `aria-invalid` on error).
 */
export const Field = ({
    label,
    htmlFor,
    children,
    hint,
    error,
    className = "",
}: {
    label: React.ReactNode;
    htmlFor?: string;
    children: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    className?: string;
}) => {
    const generatedId = React.useId();
    const hintId = hint ? `${generatedId}-hint` : undefined;
    const errorId = error ? `${generatedId}-error` : undefined;
    const describedBy =
        [errorId, hintId].filter(Boolean).join(" ") || undefined;

    let control = children;
    if (describedBy && React.isValidElement(children)) {
        control = React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
                "aria-describedby": describedBy,
                ...(error ? { "aria-invalid": true } : {}),
            }
        );
    }

    return (
        <div className={`flex flex-col ${className}`.trim()}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {control}
            {error && (
                <p id={errorId} className="mt-1 text-xs text-danger-foreground">
                    {error}
                </p>
            )}
            {hint && (
                <p id={hintId} className="mt-1 text-xs text-subtle">
                    {hint}
                </p>
            )}
        </div>
    );
};
