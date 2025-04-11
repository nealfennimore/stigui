"use client";
import { useStigContext } from "@/app/context/stig";
import { Breadcrumbs } from "./breadcrumbs";

export const GroupView = ({
    stigId,
    groupId,
}: {
    stigId: string;
    groupId: string;
}) => {
    const stig = useStigContext();
    const group = stig.groups.find((group) => group.id === groupId);

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
