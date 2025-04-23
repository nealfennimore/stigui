"use client";
import { Checklist, Rule, Severity } from "@/api/generated/Checklist";
import { IDB } from "@/app/db";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { Table } from "./table";

const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

const compare = (a: { [key: string]: any }, b: { [key: string]: any }) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (const key of aKeys) {
        const aValue = a?.[key] as object | string | number | boolean;
        const bValue = b?.[key] as object | string | number | boolean;

        if (typeof aValue === "object" && typeof bValue === "object") {
            if (!compare(aValue, bValue)) {
                return false;
            }
        } else {
            if (aValue !== bValue) {
                return false;
            }
        }
    }
    return true;
};

type FormRuleProperties = Pick<
    Rule,
    "overrides" | "status" | "comments" | "finding_details"
>;

interface FormChecklistChanges {
    rule: Record<string, FormRuleProperties>;
}
export const ChecklistView = ({ checklistId }: { checklistId: string }) => {
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const currentRules = useMemo(() => {
        if (!checklist) {
            return {};
        }
        return checklist.stigs
            .flatMap((stig) => stig.rules)
            .reduce((acc, rule) => {
                acc[rule.uuid] = rule;
                return acc;
            }, {} as Record<string, Rule>);
    }, [checklist]);

    useEffect(() => {
        (async () => {
            const checklist = await IDB.exportChecklist(checklistId);
            setChecklist(checklist);
        })();
    }, [checklistId]);

    const handleChange = useMemo(
        () => (e: Event) => {
            if (!formRef.current) {
                return;
            }
            const formData = new FormData(formRef.current);
            let data = { rule: {} } as FormChecklistChanges;

            for (const [key, value] of formData.entries()) {
                const [type, uuid, ...paths] = key.split(".");
                if (
                    type !== "rule" ||
                    !paths.every((path) =>
                        [
                            "overrides",
                            "status",
                            "comments",
                            "finding_details",
                            "severity",
                            "reason",
                        ].includes(path)
                    )
                ) {
                    continue;
                }

                let length = paths.length;
                let currentRule = currentRules[uuid];

                // @ts-ignore
                if (length === 1 && currentRule?.[paths[0]] === value) {
                    continue;
                }
                if (!data.rule[uuid]) {
                    data.rule[uuid] = {} as FormRuleProperties;
                }
                let nextRuleData = data.rule[uuid];
                for (const [idx, path] of paths.entries()) {
                    // @ts-ignore
                    if (nextRuleData[path] === undefined && length > 1) {
                        // @ts-ignore
                        nextRuleData[path] = {};
                    }
                    if (idx === length - 1) {
                        // @ts-ignore
                        nextRuleData[path] = value;
                    } else {
                        // @ts-ignore
                        nextRuleData = nextRuleData[path];
                    }
                }
            }
            let updates = [];
            for (const [uuid, value] of Object.entries(data.rule)) {
                // Skip if only overrides are changed
                // and the overrides are the same as the current overrides
                if (
                    Object.keys(value).length === 1 &&
                    value.overrides &&
                    compare(value.overrides, currentRules[uuid].overrides)
                ) {
                    continue;
                }
                let rule = { ...currentRules[uuid], ...value, uuid } as Rule;
                updates.push(IDB.rules.put(rule));
            }
            Promise.all(updates).then(console.log);
        },
        [currentRules]
    );

    const debouncedHandleChange = useMemo(
        () => debounce(handleChange, 500),
        [handleChange]
    );

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Breadcrumbs />

            <section className="w-full flex flex-col">
                <h1 className="text-3xl my-6">{checklist?.title}</h1>
                <p>{checklist?.id}</p>
            </section>

            <section>
                <form
                    ref={formRef}
                    name="checklist"
                    onSubmit={(e) => e.preventDefault()}
                    onChange={debouncedHandleChange}
                >
                    {checklist?.stigs.map((stig) => (
                        <div key={stig.uuid} className="my-4">
                            <h2 className="text-3xl">STIG</h2>
                            <h3 className="text-2xl">{stig.stig_name}</h3>
                            <p>{stig.display_name}</p>
                            <p>{stig.release_info}</p>
                            <p>{stig.reference_identifier}</p>D
                            <p>Version {stig.version}</p>
                            <p>{stig.size} rules</p>
                            <h3 className="text-2xl mt-6">Rules</h3>
                            <Table
                                // sorters={sorters}
                                // filters={filters}
                                tableHeaders={[
                                    { text: "Title" },
                                    { text: "Version" },
                                    { text: "Classification" },
                                    { text: "Discussion" },
                                    { text: "Check" },
                                    { text: "Fix" },
                                    { text: "Severity" },
                                    { text: "Status" },
                                    { text: "Comments" },
                                    { text: "Finding Details" },
                                ]}
                                tableBody={stig.rules.map((rule) => ({
                                    values: [
                                        rule.rule_title,
                                        rule.rule_version,
                                        rule.classification,
                                        rule.discussion,
                                        rule.check_content,
                                        rule.fix_text,
                                        rule.severity,
                                        rule.status,
                                        rule.comments,
                                        rule.finding_details,
                                    ],
                                    columns: [
                                        rule.rule_title,
                                        rule.rule_version,
                                        rule.classification,
                                        rule.discussion,
                                        rule.check_content,
                                        rule.fix_text,
                                        <>
                                            <select
                                                defaultValue={
                                                    rule.overrides?.severity
                                                        ?.severity ??
                                                    rule.severity
                                                }
                                                form="checklist"
                                                name={`rule.${rule.uuid}.overrides.severity.severity`}
                                                className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                            >
                                                <option value={Severity.High}>
                                                    High/CAT I
                                                </option>
                                                <option value={Severity.Medium}>
                                                    Medium/CAT II
                                                </option>
                                                <option value={Severity.Low}>
                                                    Low/CAT III
                                                </option>
                                                <option value={Severity.Info}>
                                                    Info/CAT IV
                                                </option>
                                            </select>
                                            {rule.overrides?.severity
                                                ?.severity &&
                                                rule.severity !==
                                                    rule.overrides?.severity
                                                        ?.severity && (
                                                    <textarea
                                                        form="checklist"
                                                        name={`rule.${rule.uuid}.overrides.severity.reason`}
                                                        className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                                        defaultValue={
                                                            rule.overrides
                                                                ?.severity
                                                                ?.reason
                                                        }
                                                    ></textarea>
                                                )}
                                        </>,
                                        <select
                                            form="checklist"
                                            defaultValue={rule.status}
                                            name={`rule.${rule.uuid}.status`}
                                            className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                        >
                                            <option value="not_a_finding">
                                                Not a Finding
                                            </option>
                                            <option value="not_applicable">
                                                Not Applicable
                                            </option>
                                            <option value="not_reviewed">
                                                Not Reviewed
                                            </option>
                                            <option value="open">Open</option>
                                        </select>,
                                        <textarea
                                            form="checklist"
                                            name={`rule.${rule.uuid}.comments`}
                                            className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                            defaultValue={rule.comments}
                                        ></textarea>,
                                        <textarea
                                            form="checklist"
                                            name={`rule.${rule.uuid}.finding_details`}
                                            className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                            defaultValue={rule.finding_details}
                                        ></textarea>,
                                    ],
                                }))}
                                initialOrders={[]}
                            />
                            {stig.rules.map((rule) => (
                                <div key={rule.group_id} className="my-4">
                                    <h4 className="text-xl">
                                        {rule.rule_title}
                                    </h4>
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
                                                    rule.overrides?.severity
                                                        ?.severity ??
                                                    rule.severity
                                                }
                                                name={`rule.${rule.uuid}.overrides.severity.severity`}
                                                className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                            >
                                                <option value={Severity.High}>
                                                    High/CAT I
                                                </option>
                                                <option value={Severity.Medium}>
                                                    Medium/CAT II
                                                </option>
                                                <option value={Severity.Low}>
                                                    Low/CAT III
                                                </option>
                                                <option value={Severity.Info}>
                                                    Info/CAT IV
                                                </option>
                                            </select>
                                            {rule.overrides?.severity
                                                ?.severity &&
                                                rule.severity !==
                                                    rule.overrides?.severity
                                                        ?.severity && (
                                                    <textarea
                                                        name={`rule.${rule.uuid}.overrides.severity.reason`}
                                                        className="w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                                        defaultValue={
                                                            rule.overrides
                                                                ?.severity
                                                                ?.reason
                                                        }
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
                                        <option value="not_a_finding">
                                            Not a Finding
                                        </option>
                                        <option value="not_applicable">
                                            Not Applicable
                                        </option>
                                        <option value="not_reviewed">
                                            Not Reviewed
                                        </option>
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
                            ))}
                        </div>
                    ))}
                </form>
            </section>
        </Suspense>
    );
};
