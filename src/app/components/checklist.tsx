"use client";
import { Checklist, Rule, Severity } from "@/api/generated/Checklist";
import { IDB } from "@/app/db";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";

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

    useEffect(() => {
        // if (formRef.current) {
        //     const formData = new FormData(formRef.current);
        //     const data = Object.fromEntries(formData.entries());
        //     console.log(data);
        // }
        const handleChange = (e: Event) => {
            const formData = new FormData(formRef.current!);
            let data = { rule: {} } as FormChecklistChanges;

            console.log(data);

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
                } else if (paths[0] === "overrides") {
                    let currentRuleValue =
                        // @ts-ignore
                        currentRule?.[paths[0]]?.[paths[1]]?.[paths[2]] ??
                        // @ts-ignore
                        currentRule?.[paths[1]];
                    if (currentRuleValue === value) {
                        continue;
                    }
                }
                if (!data.rule[uuid]) {
                    data.rule[uuid] = {} as FormRuleProperties;
                }
                let nextData = data.rule[uuid];
                for (const [idx, path] of paths.entries()) {
                    // @ts-ignore
                    if (nextData[path] === undefined) {
                        // @ts-ignore
                        nextData[path] = {};
                    }
                    if (idx === length - 1) {
                        // @ts-ignore
                        nextData[path] = value;
                    } else {
                        // @ts-ignore
                        nextData = nextData[path];
                    }
                }
            }
            let updates = [];
            for (const [key, value] of Object.entries(data.rule)) {
                let payload = { ...currentRules[key], ...value };
                updates.push(IDB.rules.put(payload));
            }
            Promise.all(updates).then(console.log);
        };

        formRef.current?.addEventListener("change", handleChange);
        return () => {
            formRef.current?.removeEventListener("change", handleChange);
        };
    }, [checklist, formRef.current, currentRules]);

    return (
        <Suspense>
            <Breadcrumbs />

            <section className="w-full flex flex-col">
                <h1 className="text-3xl my-6">{checklist?.title}</h1>
                <p>{checklist?.id}</p>
            </section>

            <section>
                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
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
