"use client";
import type { Rule as IRule } from "@/api/generated/Checklist";
import { Table } from "@/app/components/table";
import { Severity } from "@/api/generated/Checklist";

type Props = {
    rule: IRule;
};

export const Rule = ({ rule }: Props) => {
    return (
        <div className="my-4">
            <h4 className="text-xl">{rule.rule_title}</h4>
            <p>{rule.rule_version}</p>
            <h6 className="mt-4">Classification</h6>
            <p>{rule.classification}</p>
            <h6 className="mt-4">Discussion</h6>
            <p>{rule.discussion}</p>
            <h6 className="mt-4">Check</h6>
            <p>{rule.check_content}</p>
            <h6 className="mt-4">Fix</h6>
            <p>{rule.fix_text}</p>
            <h6 className="mt-4">Severity</h6>
            {
                <>
                    <select
                        defaultValue={
                            rule.overrides?.severity?.severity ?? rule.severity
                        }
                        name={`rule.${rule.uuid}.overrides.severity.severity`}
                        className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                    >
                        <option value={Severity.High}>High/CAT I</option>
                        <option value={Severity.Medium}>Medium/CAT II</option>
                        <option value={Severity.Low}>Low/CAT III</option>
                        <option value={Severity.Info}>Info/CAT IV</option>
                    </select>
                    {rule.overrides?.severity?.severity &&
                        rule.severity !==
                            rule.overrides?.severity?.severity && (
                            <textarea
                                name={`rule.${rule.uuid}.overrides.severity.reason`}
                                className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                defaultValue={rule.overrides?.severity?.reason}
                            ></textarea>
                        )}
                </>
            }

            <h6 className="mt-4">Status</h6>
            <select
                defaultValue={rule.status}
                name={`rule.${rule.uuid}.status`}
                className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
            >
                <option value="not_a_finding">Not a Finding</option>
                <option value="not_applicable">Not Applicable</option>
                <option value="not_reviewed">Not Reviewed</option>
                <option value="open">Open</option>
            </select>
            <h6 className="mt-4">Comments</h6>
            <textarea
                name={`rule.${rule.uuid}.comments`}
                className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                defaultValue={rule.comments}
            ></textarea>
            <h6 className="mt-4">Finding Details</h6>
            <textarea
                name={`rule.${rule.uuid}.finding_details`}
                className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                defaultValue={rule.finding_details}
            ></textarea>
        </div>
    );
};
