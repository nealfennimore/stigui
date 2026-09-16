import { Severity } from "@/api/generated/Checklist";

export const SeverityPriority = {
    [Severity.High]: 4,
    [Severity.Medium]: 3,
    [Severity.Low]: 2,
    [Severity.Info]: 1,
};

/** Sort comparator: lower severity first (use reversed for high first). */
export const bySeverity = (a: Severity, b: Severity) => {
    return SeverityPriority[a] - SeverityPriority[b];
};
