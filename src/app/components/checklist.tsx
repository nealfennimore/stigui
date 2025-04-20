"use client";
import { Checklist } from "@/api/generated/Checklist";
import { IDB } from "@/app/db";
import { Suspense, useEffect, useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";
export const ChecklistView = ({ checklistId }: { checklistId: string }) => {
    const [checklist, setChecklist] = useState<Checklist | null>(null);

    useEffect(() => {
        (async () => {
            const checklist = await IDB.exportChecklist(checklistId);
            setChecklist(checklist);
        })();
    }, [checklistId]);

    if (!checklist) {
        return null;
    }

    return (
        <Suspense>
            <Breadcrumbs />

            <section className="w-full flex flex-col">
                <h1 className="text-3xl my-6">{checklist?.title}</h1>
                <p>{checklist?.id}</p>
            </section>

            <section>
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
                                <h4 className="text-xl">{rule.rule_title}</h4>
                                <p>{rule.rule_version}</p>
                                <h6 className="mt-4">Severity</h6>
                                <p>{rule.severity}</p>
                                <h6 className="mt-4">Classification</h6>
                                <p>{rule.classification}</p>
                                <h6 className="mt-4">Status</h6>
                                <select
                                    value={rule.status}
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
                                <h6 className="mt-4">Discussion</h6>
                                <p>{rule.discussion}</p>
                                <h6 className="mt-4">Check</h6>
                                <p>{rule.check_content}</p>
                                <h6 className="mt-4">Fix</h6>
                                <p>{rule.fix_text}</p>
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
            </section>
        </Suspense>
    );
};
