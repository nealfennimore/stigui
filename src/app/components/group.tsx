"use client";
import { useManifestContext } from "@/app/context";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Breadcrumbs } from "./breadcrumbs";



export const GroupView = ({
    stigId,
    groupId,
}: {
    stigId: string;
    groupId: string;
}) => {
    const manifest = useManifestContext();
    const router = useRouter();
    const stig = use(manifest?.getStig(stigId))
    const group = use(manifest?.getGroup(stigId, groupId))

    if (!stig || !group) {
        return null;
    }


    return (
        <>
            <Breadcrumbs stigId={stigId} group={group} />
            <section className="w-full flex flex-col">
                <div className="mb-4">
                    <h4 className="text-2xl">
                        {group.id}
                    </h4>
                    <h4 className="text-lg">{group.rule.title}</h4>
                    <p>{group.rule.severity}</p>

                    <h4 className="text-lg mt-4">Description</h4>
                    <p
                        className="text-base discussion"
                    >{group.rule.description}</p>
                    
                    <h4 className="text-lg mt-4">Check</h4>
                    <p
                        className="text-base discussion"
                    >{group.rule.check}</p>

                    <h4 className="text-lg mt-4">Fix</h4>
                    <p
                        className="text-base discussion"
                    >{group.rule.fixText}</p>
                </div>
            </section>
        </>
    );
};
