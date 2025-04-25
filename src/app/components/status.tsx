"use client";

import { Status } from "@/api/generated/Checklist";
import { ElementType } from "react";

export const StatusPriority = {
    [Status.Open]: 4,
    [Status.NotReviewed]: 3,
    [Status.NotAFinding]: 2,
    [Status.NotApplicable]: 1,
};

export const byStatus = (a: Status, b: Status) => {
    return StatusPriority[a] - StatusPriority[b];
};

const StatusColor = {
    [Status.Open]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    [Status.NotReviewed]:
        "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
    [Status.NotAFinding]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    [Status.NotApplicable]:
        "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300",
};
const StatusColorSelected = {
    [Status.Open]: "border border-red-200 dark:border-red-700",
    [Status.NotReviewed]: "border border-zinc-200 dark:border-zinc-700",
    [Status.NotAFinding]: "border border-green-200 dark:border-green-700",
    [Status.NotApplicable]: "border border-stone-200 dark:border-stone-700",
};

export const StatusBadge = ({
    status,
    Element = "span",
    onClick,
    selected = false,
    count,
}: {
    status: Status;
    Element?: ElementType;
    onClick?: () => void;
    selected?: boolean;
    count?: number;
}) => {
    let color = StatusColor[status];
    if (selected) {
        color = `${color} ${StatusColorSelected[status]}`;
    }

    return (
        <Element
            className={`text-sm max-sm:text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm whitespace-nowrap ${color}`}
            onClick={onClick}
        >
            <span>{status.replaceAll("_", " ")}</span>
            {!isNaN(Number(count)) && (
                <span className="text-xs ml-1">{count}</span>
            )}
        </Element>
    );
};
