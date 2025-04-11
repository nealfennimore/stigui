"use client";
import { useManifestContext } from "@/app/context/manifest";
import { useStigContext } from "@/app/context/stig";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "./breadcrumbs";



export const StigView = ({
    stigId,
}: {
    stigId: string;
}) => {
    const manifest = useManifestContext();
    const stig = useStigContext();
    const {title} = manifest.byId(stigId);

    if (!stig) {
        return null;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Breadcrumbs stigId={stigId} />
            <h3 className="text-3xl mt-6">
                {title}
                {/* <StatusState statuses={statuses} /> */}
            </h3>
           <p
                className="text-base discussion"
            >{stig.description}</p>
            <section className="w-full flex flex-col">
                {stig.profiles?.map((profile) => (
                    <details key={profile.id} className="mb-4">
                        <summary className="text-xl">
                            {profile.title}
                        </summary>
                        <ul className="mb-4">
                            {profile.select.map((selection) => (
                                <li key={`${profile.id}-${selection.id}`}>
                                    <Link
                                        className="flex flex-col"
                                        href={`/stigs/${stigId}/groups/${selection.id}`}
                                    >
                                    {selection.id}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </details>
                ))}
                
            </section>
            <hr />
            <section className="w-full flex flex-col">
                {stig.groups?.map((group) => (
                    <details key={group.id} className="mb-4">
                        <summary className="text-xl">
                            {group.id}
                        </summary>
                        <div className="mb-4">
                            <h3 className="text-xl">{group.rule.title}</h3>
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
                    </details>
                ))}
            </section>
            {/* 
            <a
                href={`https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_171_3_0_0/home?element=${requirement.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-600"
            >
                View CPRT {requirement.id}
            </a>
            <section className="w-full flex flex-col">
                <SecurityForm
                    requirement={requirement}
                    groupings={groupings}
                    initialState={initialState}
                    setInitialState={setInitialState}
                    isHydrating={isHydrating}
                    setStatuses={setStatuses}
                    prev={prev}
                    next={next}
                />
            </section> */}
        </Suspense>
    );
};
