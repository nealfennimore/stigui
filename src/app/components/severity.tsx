"use client";

import { Severity } from "@/api/generated/Checklist";
import { ElementType } from "react";

export const SeverityPriority = {
    [Severity.High]: 4,
    [Severity.Medium]: 3,
    [Severity.Low]: 2,
    [Severity.Info]: 1,
};

export const bySeverity = (a: Severity, b: Severity) => {
    return SeverityPriority[a] - SeverityPriority[b];
};

const SeverityColor = {
    [Severity.High]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    [Severity.Medium]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    [Severity.Low]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    [Severity.Info]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};
const SeverityColorSelected = {
    [Severity.High]: "ring-2 ring-red-400 dark:ring-red-500",
    [Severity.Medium]: "ring-2 ring-orange-400 dark:ring-orange-500",
    [Severity.Low]: "ring-2 ring-yellow-400 dark:ring-yellow-500",
    [Severity.Info]: "ring-2 ring-blue-400 dark:ring-blue-500",
};

export const SeverityBadge = ({
    severity,
    count,
    Element = "span",
    onClick,
    selected = false,
}: {
    severity: Severity;
    count?: number;
    Element?: ElementType;
    onClick?: () => void;
    selected?: boolean;
}) => {
    let color = SeverityColor[severity];
    if (selected) {
        color = `${color} ${SeverityColorSelected[severity]}`;
    }

    return (
        <Element
            className={`inline-flex items-center text-sm max-sm:text-xs font-medium me-2 mb-1 px-2.5 py-1 rounded-md transition-shadow ${
                onClick ? "cursor-pointer" : ""
            } ${color}`}
            onClick={onClick}
        >
            <span>{severity}</span>
            {!isNaN(Number(count)) && (
                <span className="text-xs ml-1.5 opacity-70">{count}</span>
            )}
        </Element>
    );
};
