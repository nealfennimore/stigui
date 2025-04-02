"use client";
import { useManifestContext } from "@/app/context";
import { IDB } from "@/app/db";
import Link from "next/link";
import { useEffect } from "react";
import { Breadcrumbs } from "./breadcrumbs";

export const Stigs = () => {
    const manifest = useManifestContext();
    if (!manifest.elements?.length) {
        return null;
    }

    useEffect(() => {
        async function fetchInitialState() {
            const idbRequirements = await IDB.requirements.getAll();

            // const status = families.reduce((acc, cur) => {
            //     acc[cur.element_identifier] = [];
            //     return acc;
            // }, {});
            // for (const family of families) {
            //     const familyId = family.element_identifier;
            //     const familyRequirements =
            //         manifest.requirements.byFamily[familyId];
            //     const storedRequirements = idbRequirements?.reduce(
            //         (acc, cur) => {
            //             acc[cur.id] = cur;
            //             return acc;
            //         },
            //         {}
            //     );

            //     const storedIds = new Set(Object.keys(storedRequirements));
            //     const hasFamilyBeenWorkedUpon = familyRequirements.some((r) =>
            //         storedIds.has(r.id)
            //     );
            //     for (const requirement of familyRequirements) {
            //         const securityRequirements =
            //             manifest.securityRequirements.byRequirements[
            //                 requirement.id
            //             ];

            //         const stored = storedRequirements[requirement.id];

            //         if (!stored) {
            //             status[familyId].push(
            //                 hasFamilyBeenWorkedUpon
            //                     ? Status.NEEDS_WORK
            //                     : Status.NOT_STARTED
            //             );
            //             continue;
            //         }
            //         const values = Object.values(
            //             stored.bySecurityRequirementId
            //         );
            //         if (securityRequirements.length !== values.length) {
            //             status[familyId].push(Status.NOT_STARTED);
            //             continue;
            //         }
            //         status[familyId] = [...status[familyId], ...values];
            //     }

            //     setStatus(status);
            // }
        }
        fetchInitialState();
    }, [manifest.elements]);

    return (
        <>
            <Breadcrumbs />
            <h2 className="text-4xl">STIGs</h2>
            <ul>
                {manifest.elements.map((element) => (
                    <li className="flex mb-2" key={element.id}>
                        <Link
                            className="flex flex-col"
                            href={`/stigs/${element.id}`}
                        >
                            <h3 className="text-2xl flex flex-row">
                                {/* <StatusState
                                    statuses={
                                        status?.[family.element_identifier]
                                    }
                                /> */}
                                {/* <span className="flex flex-col mr-2">
                                    {element.id}:
                                </span> */}
                                <span className="flex flex-col">
                                    {element.title}
                                </span>
                            </h3>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
};
