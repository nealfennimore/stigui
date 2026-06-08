"use client";
import type { Rule as IRule } from "@/api/generated/Checklist";
import { Severity } from "@/api/generated/Checklist";
import { buttonClasses } from "@/app/components/ui/button";
import { Field, Input, Select, Textarea } from "@/app/components/ui/field";
import { useState } from "react";

type Props = {
    rule: IRule | null;
    onRemove?: (rule: IRule) => void;
};

export const RuleEdit = ({ rule, onRemove }: Props) => {
    if (!rule) {
        return null;
    }

    const [initialSeverity, setStatus] = useState(
        rule.overrides?.severity?.severity ?? rule.severity
    );

    return (
        <section className="my-2 flex flex-col gap-6" key={rule.uuid}>
            <div>
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted mb-2">
                    ℹ️ Check
                </h3>
                <p className="text-sm text-foreground whitespace-pre-line">
                    {rule.check_content}
                </p>
            </div>
            <div>
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted mb-2">
                    ✔️ Fix
                </h3>
                <p className="text-sm text-foreground whitespace-pre-line">
                    {rule.fix_text}
                </p>
            </div>
            <div className="flex gap-6 items-end flex-wrap">
                <Field label="Status" htmlFor="status">
                    <Select
                        defaultValue={rule.status}
                        id="status"
                        name={`rule.${rule.uuid}.status`}
                    >
                        <option value="not_a_finding">Not a Finding</option>
                        <option value="not_applicable">Not Applicable</option>
                        <option value="not_reviewed">Not Reviewed</option>
                        <option value="open">Open</option>
                    </Select>
                </Field>
                <Field label="Severity" htmlFor="severity">
                    <Select
                        defaultValue={
                            rule.overrides?.severity?.severity ?? rule.severity
                        }
                        onChange={(e) => {
                            setStatus(e.target.value as Severity);
                        }}
                        id="severity"
                        name={`rule.${rule.uuid}.overrides.severity.severity`}
                    >
                        <option value={Severity.High}>High/CAT I</option>
                        <option value={Severity.Medium}>Medium/CAT II</option>
                        <option value={Severity.Low}>Low/CAT III</option>
                        <option value={Severity.Info}>Info/CAT IV</option>
                    </Select>
                </Field>

                {initialSeverity !== rule.severity && (
                    <Field
                        label="Severity Override Reason"
                        htmlFor="reason"
                        className="flex-1 min-w-[12rem]"
                    >
                        <Input
                            id="reason"
                            name={`rule.${rule.uuid}.overrides.severity.reason`}
                            defaultValue={rule.overrides?.severity?.reason}
                        />
                    </Field>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <Field label="Comments" htmlFor="comments">
                    <Textarea
                        id="comments"
                        className="h-32"
                        name={`rule.${rule.uuid}.comments`}
                        defaultValue={rule.comments}
                    />
                </Field>
                <Field label="Finding Details" htmlFor="finding_details">
                    <Textarea
                        id="finding_details"
                        className="h-32"
                        name={`rule.${rule.uuid}.finding_details`}
                        defaultValue={rule.finding_details}
                    />
                </Field>
            </div>
            {onRemove && (
                <div className="flex justify-end border-t border-border pt-4">
                    <button
                        type="button"
                        onClick={() => onRemove(rule)}
                        className={buttonClasses({
                            variant: "secondary",
                            size: "sm",
                            className:
                                "text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900",
                        })}
                    >
                        🗑️ Remove from checklist
                    </button>
                </div>
            )}
        </section>
    );
};
