"use client";

import { Status } from "@/api/generated/Checklist";
import { Badge, BadgeTone } from "@/app/components/ui/badge";
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

export const StatusTone: Record<Status, BadgeTone> = {
    [Status.Open]: "danger",
    [Status.NotReviewed]: "neutral",
    [Status.NotAFinding]: "success",
    [Status.NotApplicable]: "contrast",
};

export const StatusBadge = ({
    status,
    onClick,
    selected = false,
    count,
}: {
    status: Status;
    /** @deprecated Badge renders a button when onClick is set. */
    Element?: ElementType;
    onClick?: () => void;
    selected?: boolean;
    count?: number;
}) => (
    <Badge
        tone={StatusTone[status]}
        count={count}
        onClick={onClick}
        selected={selected}
        className="me-2 mb-1 capitalize"
    >
        {status.replaceAll("_", " ")}
    </Badge>
);
