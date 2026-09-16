import React from "react";

export const Skeleton = ({ className = "" }: { className?: string }) => (
    <div
        aria-hidden="true"
        className={`animate-pulse rounded-md bg-surface-muted ${className}`.trim()}
    />
);

export const SkeletonText = ({
    lines = 3,
    className = "",
}: {
    lines?: number;
    className?: string;
}) => (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
        {Array.from({ length: lines }, (_, index) => (
            <Skeleton
                key={index}
                className={`h-4 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
            />
        ))}
    </div>
);

/** Page-level fallback that mimics a table card while data loads. */
export const SkeletonTable = ({
    rows = 5,
    className = "",
}: {
    rows?: number;
    className?: string;
}) => (
    <div
        className={`w-full rounded-lg border border-border bg-surface shadow-card overflow-hidden ${className}`.trim()}
    >
        <div className="bg-surface-muted border-b border-border px-6 py-3.5">
            <Skeleton className="h-4 w-1/4 bg-border" />
        </div>
        <div className="flex flex-col divide-y divide-border">
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="px-6 py-4">
                    <Skeleton
                        className={`h-4 ${index % 2 ? "w-2/3" : "w-3/4"}`}
                    />
                </div>
            ))}
        </div>
    </div>
);
