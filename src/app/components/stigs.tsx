"use client";
import { useManifestContext } from "@/app/context/manifest";
import { IDB } from "@/app/db";
import Link from "next/link";
import { useEffect } from "react";

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
            <section className="w-full flex flex-col">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    STIG
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                >
                                    Version
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                >
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {manifest.elements.map((element) => (
                                <tr
                                    key={`${element.id}`}
                                    className="odd:bg-white odd:dark:bg-zinc-900 even:bg-zinc-50 even:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200"
                                >
                                    <td
                                        scope="row"
                                        className="px-6 py-4 font-medium text-zinc-900 whitespace-nowrap dark:text-white"
                                    >
                                        <Link
                                            className="flex flex-col"
                                            href={`/stigs/${element.id}`}
                                        >
                                            {element.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-pre-line text-center">
                                        {element.version}
                                    </td>
                                    <td className="px-6 py-4 whitespace-pre-line text-center">
                                        {element.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};
