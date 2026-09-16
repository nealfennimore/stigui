"use client";
import { Rule, Severity, Status } from "@/api/generated/Checklist";
import React from "react";

/** Short label used on rule cards and filter pills. */
export const STATUS_LABEL: Record<Status, string> = {
    [Status.Open]: "Open",
    [Status.NotAFinding]: "Not a Finding",
    [Status.NotApplicable]: "Not Applicable",
    [Status.NotReviewed]: "To review",
};

/** Formal CKLB name, used by the status control and bulk actions. */
export const STATUS_NAME: Record<Status, string> = {
    [Status.Open]: "Open",
    [Status.NotAFinding]: "Not a Finding",
    [Status.NotApplicable]: "Not Applicable",
    [Status.NotReviewed]: "Not Reviewed",
};

/** Status control order; the 1–4 shortcuts follow it. */
export const STATUS_ORDER: Status[] = [
    Status.Open,
    Status.NotAFinding,
    Status.NotApplicable,
    Status.NotReviewed,
];

export const SEVERITY_LABEL: Record<Severity, { cat: string; name: string }> =
    {
        [Severity.High]: { cat: "CAT I", name: "High" },
        [Severity.Medium]: { cat: "CAT II", name: "Medium" },
        [Severity.Low]: { cat: "CAT III", name: "Low" },
        [Severity.Info]: { cat: "CAT IV", name: "Info" },
    };

export const SEVERITY_ORDER: Severity[] = [
    Severity.High,
    Severity.Medium,
    Severity.Low,
    Severity.Info,
];

export type PillTone =
    | "danger"
    | "success"
    | "neutral"
    | "warning"
    | "caution"
    | "info";

const toneClasses: Record<PillTone, string> = {
    danger: "bg-danger-surface text-danger-foreground",
    success: "bg-success-surface text-success-foreground",
    neutral: "bg-neutral-surface text-neutral-foreground",
    warning: "bg-warning-surface text-warning-foreground",
    caution: "bg-caution-surface text-caution-foreground",
    info: "bg-info-surface text-info-foreground",
};

export const statusTone: Record<Status, PillTone> = {
    [Status.Open]: "danger",
    [Status.NotAFinding]: "success",
    [Status.NotApplicable]: "neutral",
    [Status.NotReviewed]: "neutral",
};

export const severityTone: Record<Severity, PillTone> = {
    [Severity.High]: "danger",
    [Severity.Medium]: "warning",
    [Severity.Low]: "caution",
    [Severity.Info]: "info",
};

export const effectiveSeverity = (rule: Rule): Severity =>
    rule.overrides?.severity?.severity ?? rule.severity;

export const Pill = ({
    tone,
    size = "sm",
    className = "",
    children,
}: {
    tone: PillTone;
    size?: "sm" | "md";
    className?: string;
    children: React.ReactNode;
}) => (
    <span
        className={`inline-flex items-center whitespace-nowrap rounded-xl text-[10.5px] font-semibold leading-4 ${
            size === "md" ? "px-[9px] py-[3px]" : "px-2 py-0.5"
        } ${toneClasses[tone]} ${className}`.trim()}
    >
        {children}
    </span>
);

/** Rule-card pill: open rules also show their category. */
export const RuleStatusPill = ({ rule }: { rule: Rule }) => (
    <Pill tone={statusTone[rule.status]}>
        {STATUS_LABEL[rule.status]}
        {rule.status === Status.Open &&
            ` · ${SEVERITY_LABEL[effectiveSeverity(rule)].cat}`}
    </Pill>
);

export const SeverityPill = ({
    severity,
    overridden = false,
}: {
    severity: Severity;
    overridden?: boolean;
}) => (
    <Pill tone={severityTone[severity]} size="md">
        {SEVERITY_LABEL[severity].cat} — {SEVERITY_LABEL[severity].name}{" "}
        severity{overridden ? " (override)" : ""}
    </Pill>
);

/** Toggle pill for list filters (rule list, STIG severity filter). */
export const FilterPill = ({
    active,
    count,
    onClick,
    children,
}: {
    active: boolean;
    count?: number;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[20px] border px-[11px] py-1 text-[11.5px] font-medium transition-colors ${
            active
                ? "border-transparent bg-contrast-surface text-contrast-foreground"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
        }`}
    >
        {children}
        {count !== undefined && (
            <span className={active ? "opacity-70" : "text-subtle"}>
                {count}
            </span>
        )}
    </button>
);

const normalize = (value: string) => value.toLowerCase();

/** Search across IDs, title, CCIs and the check/fix text. */
export const matchesQuery = (rule: Rule, query: string) => {
    const needle = normalize(query.trim());
    if (!needle) {
        return true;
    }
    const haystack = [
        rule.group_id,
        rule.rule_id,
        rule.rule_version,
        rule.rule_title,
        ...rule.legacy_ids,
        ...rule.ccis,
        rule.check_content,
        rule.fix_text,
    ]
        .filter(Boolean)
        .map(normalize);
    return haystack.some((text) => text.includes(needle));
};

export const filterRules = (
    rules: Rule[],
    query: string,
    statuses: Set<Status>,
    severities: Set<Severity>
) =>
    rules.filter((rule) => {
        if (statuses.size > 0 && !statuses.has(rule.status)) {
            return false;
        }
        if (severities.size > 0 && !severities.has(effectiveSeverity(rule))) {
            return false;
        }
        return matchesQuery(rule, query);
    });
