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
    [Severity.High]: "border border-red-200 dark:border-red-700",
    [Severity.Medium]: "border border-orange-200 dark:border-orange-700",
    [Severity.Low]: "border border-yellow-200 dark:border-yellow-700",
    [Severity.Info]: "border border-blue-200 dark:border-blue-700",
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
            className={`text-sm max-sm:text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm ${color}`}
            onClick={onClick}
        >
            <span>{severity}</span>
            {!isNaN(Number(count)) && (
                <span className="text-xs ml-1">{count}</span>
            )}
        </Element>
    );
};
