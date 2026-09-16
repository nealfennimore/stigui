"use client";

import { Rule, Status } from "@/api/generated/Checklist";

export type StatusCounts = {
    counts: Record<Status, number>;
    total: number;
    assessed: number;
};

/** A rule counts as assessed once its status is anything but Not Reviewed. */
export const computeStatusCounts = (rules: Rule[]): StatusCounts => {
    const counts = {
        [Status.Open]: 0,
        [Status.NotReviewed]: 0,
        [Status.NotAFinding]: 0,
        [Status.NotApplicable]: 0,
    };
    for (const rule of rules) {
        counts[rule.status]++;
    }
    return {
        counts,
        total: rules.length,
        assessed: rules.length - counts[Status.NotReviewed],
    };
};

const SEGMENTS: { status: Status; className: string; label: string }[] = [
    { status: Status.Open, className: "bg-danger", label: "open" },
    {
        status: Status.NotAFinding,
        className: "bg-success",
        label: "not a finding",
    },
    {
        status: Status.NotApplicable,
        className: "bg-contrast",
        label: "not applicable",
    },
    {
        status: Status.NotReviewed,
        className: "bg-neutral/40",
        label: "not reviewed",
    },
];

/** Stacked status bar; same palette as the status badges. */
export const ProgressBar = ({
    progress,
    size = "md",
    className = "",
}: {
    progress: StatusCounts;
    size?: "sm" | "md";
    className?: string;
}) => {
    const { counts, total } = progress;
    const label = SEGMENTS.filter(({ status }) => counts[status] > 0)
        .map(({ status, label }) => `${counts[status]} ${label}`)
        .join(", ");

    return (
        <div
            role="img"
            aria-label={
                total === 0 ? "No rules" : `${total} rules: ${label}`
            }
            className={`w-full flex rounded-full overflow-hidden bg-surface-muted ${
                size === "sm" ? "h-1.5" : "h-2.5"
            } ${className}`.trim()}
        >
            {total > 0 &&
                SEGMENTS.map(({ status, className: segmentClass }) =>
                    counts[status] > 0 ? (
                        <div
                            key={status}
                            className={segmentClass}
                            style={{
                                width: `${(counts[status] / total) * 100}%`,
                            }}
                        />
                    ) : null
                )}
        </div>
    );
};

export const ProgressSummary = ({ progress }: { progress: StatusCounts }) => {
    const percent =
        progress.total === 0
            ? 0
            : Math.round((progress.assessed / progress.total) * 100);
    return (
        <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted">
                <span>
                    {percent}% assessed · {progress.total} rules
                </span>
                <span>
                    {progress.assessed} of {progress.total} reviewed
                </span>
            </div>
            <ProgressBar progress={progress} />
        </div>
    );
};
