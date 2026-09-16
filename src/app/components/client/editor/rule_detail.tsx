"use client";
import type { Rule } from "@/api/generated/Checklist";
import { Severity, Status } from "@/api/generated/Checklist";
import { RuleText } from "@/app/components/rule_text";
import { SeverityBadge } from "@/app/components/severity";
import { StatusTone } from "@/app/components/status";
import { Button } from "@/app/components/ui/button";
import { Disclosure } from "@/app/components/ui/disclosure";
import { Field, Input, Select, Textarea } from "@/app/components/ui/field";

const STATUS_OPTIONS: { status: Status; label: string; hint: string }[] = [
    { status: Status.Open, label: "Open", hint: "1" },
    { status: Status.NotReviewed, label: "Not Reviewed", hint: "2" },
    { status: Status.NotAFinding, label: "Not a Finding", hint: "3" },
    { status: Status.NotApplicable, label: "Not Applicable", hint: "4" },
];

const toneClasses: Record<Status, { active: string; idle: string }> = {
    [Status.Open]: {
        active: "bg-danger-surface text-danger-foreground ring-1 ring-danger-ring",
        idle: "text-muted hover:bg-danger-surface/40",
    },
    [Status.NotReviewed]: {
        active: "bg-neutral-surface text-neutral-foreground ring-1 ring-neutral-ring",
        idle: "text-muted hover:bg-neutral-surface/40",
    },
    [Status.NotAFinding]: {
        active: "bg-success-surface text-success-foreground ring-1 ring-success-ring",
        idle: "text-muted hover:bg-success-surface/40",
    },
    [Status.NotApplicable]: {
        active: "bg-contrast-surface text-contrast-foreground ring-1 ring-contrast-ring",
        idle: "text-muted hover:bg-surface-muted",
    },
};

/** One-click status control; keys 1–4 map to the same order. */
export const StatusControl = ({
    value,
    onChange,
}: {
    value: Status;
    onChange: (status: Status) => void;
}) => (
    <div
        role="radiogroup"
        aria-label="Status"
        className="inline-flex flex-wrap gap-1 rounded-lg border border-border-strong bg-surface p-1"
    >
        {STATUS_OPTIONS.map(({ status, label, hint }) => (
            <button
                key={status}
                type="button"
                role="radio"
                aria-checked={value === status}
                onClick={() => onChange(status)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    value === status
                        ? toneClasses[status].active
                        : toneClasses[status].idle
                }`}
            >
                {label}
                <kbd className="rounded border border-border-strong px-1 text-[10px] text-subtle max-md:hidden">
                    {hint}
                </kbd>
            </button>
        ))}
    </div>
);

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
};

export const RuleDetail = ({
    rule,
    handlers,
    onPrevious,
    onNext,
    position,
}: {
    rule: Rule;
    handlers: RuleDetailHandlers;
    onPrevious?: () => void;
    onNext?: () => void;
    position?: { index: number; total: number };
}) => {
    const effectiveSeverity =
        rule.overrides?.severity?.severity ?? rule.severity;
    const hasOverride = effectiveSeverity !== rule.severity;

    return (
        <section key={rule.uuid} className="flex flex-col gap-5">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 flex-wrap min-w-0">
                        <SeverityBadge severity={effectiveSeverity} />
                        <span className="text-xs text-subtle font-[family-name:var(--font-geist-mono)]">
                            {rule.group_id} · {rule.rule_id}
                        </span>
                    </div>
                    {(onPrevious || onNext) && (
                        <div className="flex items-center gap-1 shrink-0">
                            {position && (
                                <span className="text-xs text-subtle mr-1">
                                    {position.index + 1} / {position.total}
                                </span>
                            )}
                            <button
                                type="button"
                                aria-label="Previous rule"
                                disabled={!onPrevious}
                                onClick={onPrevious}
                                className="p-1.5 rounded-md text-subtle hover:bg-surface-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                aria-label="Next rule"
                                disabled={!onNext}
                                onClick={onNext}
                                className="p-1.5 rounded-md text-subtle hover:bg-surface-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                <h3 className="text-base font-semibold text-foreground">
                    {rule.rule_title}
                </h3>
            </header>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    Status
                </span>
                <StatusControl
                    value={rule.status}
                    onChange={(status) =>
                        handlers.setStatus([rule.uuid], status)
                    }
                />
            </div>

            <div className="flex gap-4 items-end flex-wrap">
                <Field label="Severity" htmlFor={`severity-${rule.uuid}`}>
                    <Select
                        id={`severity-${rule.uuid}`}
                        value={effectiveSeverity}
                        onChange={(event) =>
                            handlers.setSeverity(
                                rule.uuid,
                                event.target.value as Severity
                            )
                        }
                    >
                        <option value={Severity.High}>High/CAT I</option>
                        <option value={Severity.Medium}>Medium/CAT II</option>
                        <option value={Severity.Low}>Low/CAT III</option>
                        <option value={Severity.Info}>Info/CAT IV</option>
                    </Select>
                </Field>
                {hasOverride && (
                    <Field
                        label="Severity Override Reason"
                        htmlFor={`reason-${rule.uuid}`}
                        className="flex-1 min-w-[12rem]"
                    >
                        <Input
                            id={`reason-${rule.uuid}`}
                            value={rule.overrides?.severity?.reason ?? ""}
                            onChange={(event) =>
                                handlers.setOverrideReason(
                                    rule.uuid,
                                    event.target.value
                                )
                            }
                        />
                    </Field>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <Field label="Finding Details" htmlFor={`finding-${rule.uuid}`}>
                    <Textarea
                        id={`finding-${rule.uuid}`}
                        className="h-28"
                        value={rule.finding_details ?? ""}
                        onChange={(event) =>
                            handlers.updateRuleText(
                                rule.uuid,
                                "finding_details",
                                event.target.value
                            )
                        }
                    />
                </Field>
                <Field label="Comments" htmlFor={`comments-${rule.uuid}`}>
                    <Textarea
                        id={`comments-${rule.uuid}`}
                        className="h-28"
                        value={rule.comments ?? ""}
                        onChange={(event) =>
                            handlers.updateRuleText(
                                rule.uuid,
                                "comments",
                                event.target.value
                            )
                        }
                    />
                </Field>
            </div>

            <div className="flex flex-col gap-3">
                <Disclosure summary="Check" defaultOpen>
                    <div className="p-5 text-sm text-foreground leading-relaxed flex flex-col gap-3">
                        <RuleText text={rule.check_content ?? ""} />
                    </div>
                </Disclosure>
                <Disclosure summary="Fix">
                    <div className="p-5 text-sm text-foreground leading-relaxed flex flex-col gap-3">
                        <RuleText text={rule.fix_text ?? ""} />
                    </div>
                </Disclosure>
                {rule.discussion && (
                    <Disclosure summary="Discussion">
                        <div className="p-5 text-sm text-foreground leading-relaxed flex flex-col gap-3">
                            <RuleText text={rule.discussion} />
                        </div>
                    </Disclosure>
                )}
            </div>

            <div className="flex justify-end border-t border-border pt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-foreground hover:bg-danger-surface"
                    onClick={() => handlers.onRemove(rule)}
                >
                    Remove from checklist
                </Button>
            </div>
        </section>
    );
};
