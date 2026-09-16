"use client";
import type { Rule } from "@/api/generated/Checklist";
import { Severity, Status } from "@/api/generated/Checklist";
import { Icon } from "@/app/components/client/editor/icons";
import {
    effectiveSeverity,
    SEVERITY_LABEL,
    SEVERITY_ORDER,
    SeverityPill,
    STATUS_NAME,
    STATUS_ORDER,
} from "@/app/components/client/editor/rule_meta";
import type { SaveState } from "@/app/components/client/editor/use_checklist_editor";
import { CopyButton } from "@/app/components/rule_panel";
import React from "react";

const selectedStatusClasses: Record<Status, string> = {
    [Status.Open]:
        "bg-danger text-danger-solid-foreground shadow-wb-open dark:shadow-none",
    [Status.NotAFinding]:
        "bg-success text-success-solid-foreground shadow-wb-pass dark:shadow-none",
    [Status.NotApplicable]:
        "bg-neutral text-neutral-solid-foreground shadow-wb-neutral dark:shadow-none",
    [Status.NotReviewed]:
        "bg-neutral text-neutral-solid-foreground shadow-wb-neutral dark:shadow-none",
};

/** Single-select status control; keys 1–4 follow the same order. */
export const StatusControl = ({
    value,
    onChange,
}: {
    value: Status;
    onChange: (status: Status) => void;
}) => (
    <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
        {STATUS_ORDER.map((status, index) => {
            const selected = value === status;
            return (
                <button
                    key={status}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={`${STATUS_NAME[status]} (${index + 1})`}
                    onClick={() => onChange(status)}
                    className={`rounded-[10px] border px-4 py-[9px] text-[12.5px] transition-colors ${
                        selected
                            ? `border-transparent font-semibold ${selectedStatusClasses[status]}`
                            : "border-border bg-surface font-medium text-wb-body hover:border-border-strong hover:bg-surface-muted"
                    }`}
                >
                    {selected && (
                        <span aria-hidden="true" className="mr-1.5">
                            ●
                        </span>
                    )}
                    {STATUS_NAME[status]}
                </button>
            );
        })}
    </div>
);

const Card = ({
    label,
    action,
    className = "",
    children,
}: {
    label: string;
    action?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section
        className={`rounded-[14px] border border-border bg-surface px-[18px] py-4 shadow-wb-card dark:shadow-none ${className}`.trim()}
    >
        <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[.07em] text-subtle">
                {label}
            </h2>
            {action}
        </div>
        {children}
    </section>
);

const CodeBlock = ({ text }: { text: string }) => (
    <pre className="m-0 whitespace-pre-wrap break-words rounded-[9px] bg-wb-inset px-3.5 py-3 font-plex-mono text-xs leading-[1.65] text-wb-body">
        {text || "—"}
    </pre>
);

const textareaClasses =
    "w-full min-h-[80px] resize-y rounded-[9px] border border-border bg-canvas px-3 py-2.5 text-[12.5px] leading-[1.55] text-wb-body placeholder:text-subtle transition-colors focus:border-accent focus:ring-2 focus:ring-ring/40 focus-visible:outline-none";

const controlClasses =
    "w-full rounded-[9px] border border-border bg-surface px-3 py-2 text-[12.5px] text-wb-body transition-colors focus:border-accent focus:ring-2 focus:ring-ring/40 focus-visible:outline-none";

const fieldLabelClasses =
    "block text-[11px] font-semibold uppercase tracking-[.07em] text-subtle";

const navButtonClasses =
    "inline-flex items-center gap-1 rounded-[9px] border border-border bg-surface px-3.5 py-2 text-xs font-medium text-wb-body transition-colors hover:border-border-strong hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-surface";

const SaveIndicator = ({ state }: { state: SaveState }) => {
    if (state === "idle") {
        return null;
    }
    const text = {
        saving: "Saving…",
        saved: "Saved ✓",
        error: "Save failed",
    }[state];
    return (
        <span
            role="status"
            className={`text-[11px] font-medium ${
                state === "error" ? "text-danger-foreground" : "text-subtle"
            }`}
        >
            {text}
        </span>
    );
};

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded border border-wb-tip-border bg-surface/60 px-1 font-plex-mono text-[10.5px]">
        {children}
    </kbd>
);

const ReferenceRow = ({
    label,
    value,
}: {
    label: string;
    value: string | string[];
}) => {
    const text = Array.isArray(value) ? value.join(", ") : value;
    return (
        <div className="flex items-baseline justify-between gap-3 text-xs text-muted">
            <span className="shrink-0 text-subtle">{label}</span>
            <span className="break-all text-right font-plex-mono text-[11.5px] font-medium">
                {text || "—"}
            </span>
        </div>
    );
};

export type RuleDetailHandlers = {
    updateRuleText: (
        uuid: string,
        field: "comments" | "finding_details",
        value: string
    ) => void;
    setStatus: (uuids: string[], status: Status) => void;
    setSeverity: (uuid: string, severity: Severity) => void;
    setOverrideReason: (uuid: string, reason: string) => void;
    onRemove: (rule: Rule) => void;
    /** Writes pending text edits now (autosave on blur). */
    flush: () => void;
};

export const RuleDetail = ({
    rule,
    handlers,
    saveState,
    onPrevious,
    onNext,
    onSaveAndNext,
    onJumpToUnreviewed,
    remaining,
    position,
}: {
    rule: Rule;
    handlers: RuleDetailHandlers;
    saveState: SaveState;
    onPrevious?: () => void;
    onNext?: () => void;
    onSaveAndNext: () => void;
    onJumpToUnreviewed?: () => void;
    /** Rules still marked Not Reviewed across the checklist. */
    remaining: number;
    position?: { index: number; total: number };
}) => {
    const severity = effectiveSeverity(rule);
    const hasOverride = severity !== rule.severity;

    return (
        <section
            key={rule.uuid}
            aria-label={rule.rule_title}
            className="flex min-h-0 flex-1 flex-col"
        >
            <header className="shrink-0 px-[26px] pt-5">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-plex-mono text-xs font-semibold text-muted">
                        {rule.group_id}
                    </span>
                    <SeverityPill severity={severity} overridden={hasOverride} />
                    <span
                        className="font-plex-mono text-[11px] text-wb-faint"
                        title="Rule ID"
                    >
                        {rule.rule_id}
                    </span>
                    <div className="flex-1" />
                    {position && (
                        <span className="text-[11px] text-subtle">
                            {position.index + 1} / {position.total}
                        </span>
                    )}
                    <button
                        type="button"
                        disabled={!onPrevious}
                        onClick={onPrevious}
                        title="Previous rule (k)"
                        className={navButtonClasses}
                    >
                        <Icon.chevronLeft className="h-3.5 w-3.5" />
                        Prev
                    </button>
                    <button
                        type="button"
                        disabled={!onNext}
                        onClick={onNext}
                        title="Next rule (j)"
                        className={navButtonClasses}
                    >
                        Next
                        <Icon.chevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
                <h1 className="mt-2.5 max-w-[56ch] text-[19px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                    {rule.rule_title}
                </h1>
                <div className="mt-4">
                    <StatusControl
                        value={rule.status}
                        onChange={(status) =>
                            handlers.setStatus([rule.uuid], status)
                        }
                    />
                </div>
            </header>

            <div className="wb-scroll grid min-h-0 flex-1 items-start gap-[18px] px-[26px] py-5 lg:overflow-y-auto xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex min-w-0 flex-col gap-3.5">
                    <Card
                        label="Check"
                        action={
                            <CopyButton
                                text={rule.check_content ?? ""}
                                label="check text"
                            />
                        }
                    >
                        <CodeBlock text={rule.check_content} />
                    </Card>
                    <Card
                        label="Fix"
                        action={
                            <CopyButton
                                text={rule.fix_text ?? ""}
                                label="fix text"
                            />
                        }
                    >
                        <CodeBlock text={rule.fix_text} />
                    </Card>
                    {rule.discussion && (
                        <Card label="Why it matters">
                            <p className="m-0 whitespace-pre-line text-[12.5px] leading-[1.6] text-wb-body [text-wrap:pretty]">
                                {rule.discussion}
                            </p>
                        </Card>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-3.5">
                    <Card
                        label="Finding details"
                        action={<SaveIndicator state={saveState} />}
                    >
                        <div className="flex flex-col gap-2">
                            <textarea
                                id={`finding-${rule.uuid}`}
                                aria-label="Finding details"
                                placeholder="What did you observe on the target?"
                                value={rule.finding_details ?? ""}
                                onChange={(event) =>
                                    handlers.updateRuleText(
                                        rule.uuid,
                                        "finding_details",
                                        event.target.value
                                    )
                                }
                                onBlur={handlers.flush}
                                className={textareaClasses}
                            />
                            <label
                                htmlFor={`comments-${rule.uuid}`}
                                className={`${fieldLabelClasses} pt-1`}
                            >
                                Comments
                            </label>
                            <textarea
                                id={`comments-${rule.uuid}`}
                                placeholder="Reviewer notes, mitigations, ticket references…"
                                value={rule.comments ?? ""}
                                onChange={(event) =>
                                    handlers.updateRuleText(
                                        rule.uuid,
                                        "comments",
                                        event.target.value
                                    )
                                }
                                onBlur={handlers.flush}
                                className={`${textareaClasses} min-h-[64px]`}
                            />
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={onSaveAndNext}
                                    className="rounded-[9px] bg-accent px-4 py-2 text-[12.5px] font-semibold text-accent-foreground shadow-wb-primary transition-colors hover:bg-accent-hover dark:shadow-none"
                                >
                                    Save &amp; next
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card label="Severity">
                        <div className="flex flex-col gap-2">
                            <select
                                aria-label="Severity"
                                value={severity}
                                onChange={(event) =>
                                    handlers.setSeverity(
                                        rule.uuid,
                                        event.target.value as Severity
                                    )
                                }
                                className={controlClasses}
                            >
                                {SEVERITY_ORDER.map((option) => (
                                    <option key={option} value={option}>
                                        {SEVERITY_LABEL[option].cat} —{" "}
                                        {SEVERITY_LABEL[option].name}
                                        {option === rule.severity
                                            ? " (benchmark)"
                                            : ""}
                                    </option>
                                ))}
                            </select>
                            {hasOverride && (
                                <>
                                    <label
                                        htmlFor={`reason-${rule.uuid}`}
                                        className={`${fieldLabelClasses} pt-1`}
                                    >
                                        Override reason
                                    </label>
                                    <input
                                        id={`reason-${rule.uuid}`}
                                        type="text"
                                        placeholder="Why does this rule carry a different severity?"
                                        value={
                                            rule.overrides?.severity?.reason ??
                                            ""
                                        }
                                        onChange={(event) =>
                                            handlers.setOverrideReason(
                                                rule.uuid,
                                                event.target.value
                                            )
                                        }
                                        onBlur={handlers.flush}
                                        className={controlClasses}
                                    />
                                </>
                            )}
                        </div>
                    </Card>

                    <Card label="References">
                        <div className="flex flex-col gap-[9px]">
                            <ReferenceRow label="CCI" value={rule.ccis} />
                            <ReferenceRow
                                label="Legacy IDs"
                                value={rule.legacy_ids}
                            />
                            <ReferenceRow label="Rule ID" value={rule.rule_id} />
                            <ReferenceRow
                                label="Version"
                                value={rule.rule_version}
                            />
                        </div>
                    </Card>

                    <div className="rounded-[14px] border border-wb-tip-border bg-wb-tip-surface px-4 py-3.5 text-xs leading-[1.55] text-wb-tip-foreground">
                        <b>Tip:</b>{" "}
                        {remaining === 0
                            ? "Every rule in this checklist has a status."
                            : `${remaining} rule${
                                  remaining === 1 ? "" : "s"
                              } still to review.`}{" "}
                        Press <Kbd>j</Kbd>/<Kbd>k</Kbd> to move and{" "}
                        <Kbd>1</Kbd>–<Kbd>4</Kbd> to set a status.{" "}
                        {remaining > 0 && onJumpToUnreviewed && (
                            <button
                                type="button"
                                onClick={onJumpToUnreviewed}
                                className="font-semibold text-wb-tip-link hover:underline"
                            >
                                Jump to next unreviewed →
                            </button>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => handlers.onRemove(rule)}
                            className="rounded-[9px] px-3 py-1.5 text-xs font-medium text-subtle transition-colors hover:bg-danger-surface hover:text-danger-foreground"
                        >
                            Remove from checklist
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
