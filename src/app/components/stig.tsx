"use client";
import { Classification, GroupWrapper } from "@/api/entities/Stig";
import { Severity } from "@/api/generated/Checklist";
import { useManifestContext } from "@/app/context/manifest";
import { useStigContext } from "@/app/context/stig";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { SeverityBadge } from "./severity";
import { Table, defaultFilter, defaultSort } from "./table";

const SeverityPriority = {
    [Severity.High]: 4,
    [Severity.Medium]: 3,
    [Severity.Low]: 2,
    [Severity.Info]: 1,
};

const bySeverity = (a: Severity, b: Severity) => {
    return SeverityPriority[b] - SeverityPriority[a];
};

const byGroupSeverity = (a: GroupWrapper, b: GroupWrapper) => {
    const value = bySeverity(a.rule.severity, b.rule.severity);
    if (value !== 0) {
        return value;
    }
    return a.id.localeCompare(b.id);
};

const sorters = [defaultSort, bySeverity, defaultSort, null];
const filters = [null, null, defaultFilter, defaultFilter];

export const StigView = ({ stigId }: { stigId: string }) => {
    const [classificationLevel, setClassficationLevel] = useState(
        Classification.Public
    );
    const manifest = useManifestContext();
    const stig = useStigContext();

    if (!stig) {
        return null;
    }

    const { title } = manifest.byId(stigId);
    const classficationProfiles = useMemo(
        () => stig.profilesByClassification,
        [classificationLevel, stig]
    );
    const classificationProfile = classficationProfiles[classificationLevel];
    const groups = useMemo(
        () =>
            stig.groupsByProfiles(Object.values(classificationProfile).flat()),
        [stig, classificationProfile]
    );
    const tableBody = useMemo(
        () =>
            Object.values(groups)
                ?.sort(byGroupSeverity)
                .map((group) => ({
                    values: [
                        group.id,
                        group.rule.severity,
                        group.rule.title,
                        group.rule.description,
                    ],
                    columns: [
                        <Link
                            className="flex flex-col whitespace-nowrap"
                            href={`/stigs/${stigId}/groups/${group.id}`}
                        >
                            {group.id}
                        </Link>,
                        <SeverityBadge severity={group.rule.severity} />,
                        group.rule.title,
                        group.rule.description,
                    ],
                })),
        [groups, stigId]
    );

    return (
        <>
            <Breadcrumbs stigId={stigId} />
            <h1 className="text-3xl mt-6">{title}</h1>
            <p className="text-base discussion">{stig.description}</p>

            <section className="w-full flex justify-between items-center">
                <aside
                    className="inline-flex rounded-md shadow-xs"
                    role="group"
                >
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded-s-lg hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:text-white dark:hover:bg-zinc-700 dark:focus:ring-blue-500 dark:focus:text-white ${
                            Classification.Public === classificationLevel
                                ? "dark:bg-zinc-500 bg-zinc-200"
                                : ""
                        }`}
                        onClick={() =>
                            setClassficationLevel(Classification.Public)
                        }
                    >
                        {Classification.Public}
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium text-zinc-900 bg-white border-t border-b border-zinc-200 hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:text-white dark:hover:bg-zinc-700 dark:focus:ring-blue-500 dark:focus:text-white ${
                            Classification.Classified === classificationLevel
                                ? "dark:bg-zinc-500 bg-zinc-200"
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
                        className={`px-4 py-2 text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded-e-lg hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:text-white dark:hover:bg-zinc-700 dark:focus:ring-blue-500 dark:focus:text-white ${
                            Classification.Sensitive === classificationLevel
                                ? "dark:bg-zinc-500 bg-zinc-200"
                                : ""
                        }`}
                        onClick={() =>
                            setClassficationLevel(Classification.Sensitive)
                        }
                    >
                        {Classification.Sensitive}
                    </button>
                </aside>
                <div className="text-zinc-600 dark:text-zinc-500 text-xs flex flex-col">
                    <span>Version: {stig.version}</span>
                    <span>Date: {stig.date.toLocaleDateString("sv-SE")}</span>
                </div>
            </section>

            <section className="w-full flex flex-col">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Table
                        sorters={sorters}
                        filters={filters}
                        tableHeaders={[
                            {
                                text: "Group ID",
                            },
                            {
                                text: "Severity",
                                className: "text-center",
                            },
                            {
                                text: "Title",
                            },
                            {
                                text: "Description",
                            },
                        ]}
                        tableBody={tableBody}
                    />
                </div>
            </section>
        </>
    );
};
