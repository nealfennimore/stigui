"use client";
import { Classification, GroupWrapper } from "@/api/entities/Stig";
import { Severity } from "@/api/generated/Checklist";
import { useManifestContext } from "@/app/context/manifest";
import { useStigContext } from "@/app/context/stig";
import Link from "next/link";
import { useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { SeverityBadge } from "./severity";

const SeverityPriority = {
    [Severity.High]: 4,
    [Severity.Medium]: 3,
    [Severity.Low]: 2,
    [Severity.Info]: 1,
};

const bySeverity = (a: GroupWrapper, b: GroupWrapper) => {
    const value =
        SeverityPriority[b.rule.severity] - SeverityPriority[a.rule.severity];
    if (value !== 0) {
        return value;
    }
    return a.id.localeCompare(b.id);
};

export const StigView = ({ stigId }: { stigId: string }) => {
    const manifest = useManifestContext();
    const stig = useStigContext();
    const [classificationLevel, setClassficationLevel] = useState(
        Classification.Public
    );

    if (!stig) {
        return null;
    }

    const { title } = manifest.byId(stigId);
    const classficationProfiles = stig.profilesByClassification;
    const classificationProfile = classficationProfiles[classificationLevel];
    const groups = stig.groupsByProfiles(
        Object.values(classificationProfile).flat()
    );

    return (
        <>
            <Breadcrumbs stigId={stigId} />
            <h3 className="text-3xl mt-6">
                {title}
                {/* <StatusState statuses={statuses} /> */}
            </h3>
            <p className="text-base discussion">{stig.description}</p>

            <div className="inline-flex rounded-md shadow-xs" role="group">
                <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white ${
                        Classification.Public === classificationLevel
                            ? "dark:bg-gray-900"
                            : ""
                    }`}
                    onClick={() => setClassficationLevel(Classification.Public)}
                >
                    {Classification.Public}
                </button>
                <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white ${
                        Classification.Classified === classificationLevel
                            ? "dark:bg-gray-900"
                            : ""
                    }`}
                    onClick={() =>
                        setClassficationLevel(Classification.Classified)
                    }
                >
                    {Classification.Classified}
                </button>
                <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white ${
                        Classification.Sensitive === classificationLevel
                            ? "dark:bg-gray-900"
                            : ""
                    }`}
                    onClick={() =>
                        setClassficationLevel(Classification.Sensitive)
                    }
                >
                    {Classification.Sensitive}
                </button>
            </div>

            <section className="w-full flex flex-col">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Group ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Severity
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Title
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(groups)
                                ?.sort(bySeverity)
                                .map((group) => (
                                    <tr
                                        key={`${group.id}`}
                                        className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            <Link
                                                className="flex flex-col"
                                                href={`/stigs/${stigId}/groups/${group.id}`}
                                            >
                                                {group.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <SeverityBadge
                                                severity={group.rule.severity}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {group.rule.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-pre-line">
                                            {group.rule.description}
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
