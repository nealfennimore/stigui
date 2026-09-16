"use client";

import { Severity } from "@/api/generated/Checklist";
import { Badge, BadgeTone } from "@/app/components/ui/badge";
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

export const SeverityTone: Record<Severity, BadgeTone> = {
    [Severity.High]: "danger",
    [Severity.Medium]: "warning",
    [Severity.Low]: "caution",
    [Severity.Info]: "info",
};

export const SeverityBadge = ({
    severity,
    count,
    onClick,
    selected = false,
}: {
    severity: Severity;
    count?: number;
    /** @deprecated Badge renders a button when onClick is set. */
    Element?: ElementType;
    onClick?: () => void;
    selected?: boolean;
}) => (
    <Badge
        tone={SeverityTone[severity]}
        count={count}
        onClick={onClick}
        selected={selected}
        className="me-2 mb-1"
    >
        {severity}
    </Badge>
);
