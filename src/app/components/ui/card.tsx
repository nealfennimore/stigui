import React from "react";

/** Rounded, bordered surface used to wrap tables and panels. */
export const cardClasses =
    "rounded-[14px] border border-border bg-surface shadow-wb-card dark:shadow-none overflow-hidden";

export const Card = ({
    className = "",
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`${cardClasses} ${className}`.trim()} {...props}>
        {children}
    </div>
);

/**
 * Card wrapper for horizontally-scrollable tables: keeps the rounded border
 * while allowing the inner table to scroll on small screens.
 */
export const TableCard = ({
    className = "",
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <div
        className={`relative overflow-x-auto rounded-[14px] border border-border bg-surface shadow-wb-card dark:shadow-none ${className}`.trim()}
    >
        {children}
    </div>
);
