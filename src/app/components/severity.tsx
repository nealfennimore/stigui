"use client";

import { Severity } from "@/api/generated/Checklist";

export const SeverityBadge = ({ severity }: { severity: Severity }) => {
    let colors = "";
    switch (severity) {
        case Severity.High:
            colors =
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            break;
        case Severity.Medium:
            colors =
                "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            break;
        case Severity.Low:
            colors =
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            break;
        default:
            colors =
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            break;
    }

    return (
        <span
            className={`text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm ${colors}`}
        >
            {severity}
        </span>
    );
};
