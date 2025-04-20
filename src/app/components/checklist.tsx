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
                                <h4 className="text-xl">{rule.group_title}</h4>
                                <p>{rule.rule_version}</p>
                                <p>Severity: {rule.severity}</p>
                                <p>Classification: {rule.classification}</p>
                                <p>Status: {rule.status}</p>
                                <p>{rule.third_party_tools}</p>
                                <p>{rule.security_override_guidance}</p>
                                <p>Discussion: {rule.discussion}</p>
                                <p>Check: {rule.check_content}</p>
                                <p>Fix: {rule.fix_text}</p>
                                <p>Comments: {rule.comments}</p>
                                <p>documentable: {rule.documentable}</p>
                                <p>{rule.finding_details}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </section>
        </Suspense>
    );
};
