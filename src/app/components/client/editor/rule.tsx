"use client";
import type { Rule as IRule } from "@/api/generated/Checklist";
import { Severity } from "@/api/generated/Checklist";
import { useState } from "react";

type Props = {
    rule: IRule | null;
};

export const RuleEdit = ({ rule }: Props) => {
    if (!rule) {
        return null;
    }

    const [initialSeverity, setStatus] = useState(
        rule.overrides?.severity?.severity ?? rule.severity
    );

    return (
        <section className="my-4" key={rule.uuid}>
            <h3 className="py-3">ℹ️ Check</h3>
            <p className="text-sm">{rule.check_content}</p>
            <h3 className="py-3">✔️ Fix</h3>
            <p className="text-sm">{rule.fix_text}</p>
            <div className="flex flex-col gap-2">
                <label className="mt-4" htmlFor="status">
                    Status
                </label>
                <select
                    defaultValue={rule.status}
                    id="status"
                    name={`rule.${rule.uuid}.status`}
                    className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                >
                    <option value="not_a_finding">Not a Finding</option>
                    <option value="not_applicable">Not Applicable</option>
                    <option value="not_reviewed">Not Reviewed</option>
                    <option value="open">Open</option>
                </select>
                <>
                    <label className="mt-4" htmlFor="severity">
                        Severity
                    </label>
                    <select
                        defaultValue={
                            rule.overrides?.severity?.severity ?? rule.severity
                        }
                        onChange={(e) => {
                            setStatus(e.target.value as Severity);
                        }}
                        id="severity"
                        name={`rule.${rule.uuid}.overrides.severity.severity`}
                        className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                    >
                        <option value={Severity.High}>High/CAT I</option>
                        <option value={Severity.Medium}>Medium/CAT II</option>
                        <option value={Severity.Low}>Low/CAT III</option>
                        <option value={Severity.Info}>Info/CAT IV</option>
                    </select>
                    {initialSeverity !== rule.severity && (
                        <>
                            <label className="mt-4" htmlFor="reason">
                                Severity Override Reason
                            </label>
                            <input
                                id="reason"
                                name={`rule.${rule.uuid}.overrides.severity.reason`}
                                className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                defaultValue={rule.overrides?.severity?.reason}
                            />
                        </>
                    )}
                </>
                <label className="mt-4" htmlFor="comments">
                    Comments
                </label>
                <textarea
                    id="comments"
                    name={`rule.${rule.uuid}.comments`}
                    className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                    defaultValue={rule.comments}
                ></textarea>
                <label className="mt-4" htmlFor="finding_details">
                    Finding Details
                </label>
                <textarea
                    id="finding_details"
                    name={`rule.${rule.uuid}.finding_details`}
                    className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                    defaultValue={rule.finding_details}
                ></textarea>
            </div>
        </section>
    );
};
