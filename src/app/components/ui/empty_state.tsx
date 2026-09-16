import React from "react";

export const EmptyState = ({
    icon,
    title,
    description,
    action,
    className = "",
}: {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`flex flex-col items-center justify-center text-center gap-2 rounded-lg border border-dashed border-border-strong p-8 ${className}`.trim()}
    >
        {icon && <div className="text-subtle mb-1">{icon}</div>}
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
        {action && <div className="mt-3 flex items-center gap-3">{action}</div>}
    </div>
);
