"use client";
import { Classification, StigWrapper } from "@/api/entities/Stig";
import { Severity } from "@/api/generated/Checklist";
import { useStigContext } from "@/app/context/stig";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { SeverityBadge } from "./severity";
import { defaultFilter, defaultSort, Order, Table } from "./table";

const SeverityPriority = {
    [Severity.High]: 4,
    [Severity.Medium]: 3,
    [Severity.Low]: 2,
    [Severity.Info]: 1,
};

const bySeverity = (a: Severity, b: Severity) => {
    return SeverityPriority[a] - SeverityPriority[b];
};

const sorters = [defaultSort, bySeverity, defaultSort, null];
const filters = [null, null, defaultFilter, defaultFilter];
const tableHeaders = [
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
        className: "max-lg:hidden",
    },
];

const download = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
};

const toCSV = (stig: StigWrapper) => {
    const csv = [
        [
            "Group ID",
            "Severity",
            "Title",
            "Description",
            "Rule ID",
            "Fix ID",
            "Fix Text",
            "Check ID",
            "Check Text",
        ].join(","),
        ...stig.groups.map((group) => {
            return [
                group.id,
                group.rule.severity,
                `"${group.rule.title.replaceAll('"', "'")}"`,
                `"${group.rule.description.replaceAll('"', "'")}"`,
                group.rule.id,
                group.rule.fix,
                `"${group.rule.fixText.replaceAll('"', "'")}"`,
                group.rule.checkId,
                `"${group.rule.check.replaceAll('"', "'")}"`,
            ].join(",");
        }),
    ];

    const blob = new Blob([csv.join("\n")], {
        type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    download(url, `${stig.id}.csv`);
    URL.revokeObjectURL(url);
};

const Button = ({
    classfication,
    selectedClassfication,
    setClassficationLevel,
    index,
    stigId,
}: {
    classfication: Classification;
    selectedClassfication: Classification;
    setClassficationLevel: (selectedClassfication: Classification) => void;
    index: number;
    stigId: string;
}) => {
    const selectedClassName =
        classfication === selectedClassfication
            ? "dark:bg-zinc-500 bg-zinc-200"
            : "dark:bg-zinc-800 bg-white";

    const idxClassName =
        index === 0 ? "rounded-s-lg border" : "border-t border-b";
    const idxClassName2 =
        index === 2 ? "rounded-e-lg border" : "border-t border-b";

    return (
        <Link
            href={`/stigs/${stigId}/${classfication}`}
            className={`px-4 py-2 text-sm font-medium text-zinc-900 border-zinc-200 hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-zinc-700 dark:text-white dark:hover:text-white dark:hover:bg-zinc-700 dark:focus:ring-blue-500 dark:focus:text-white ${selectedClassName} ${idxClassName} ${idxClassName2}`}
            onClick={() => setClassficationLevel(classfication)}
        >
            {classfication}
        </Link>
    );
};
export const StigView = ({
    stigId,
    classification,
}: {
    stigId: string;
    classification?: Classification;
}) => {
    const stig = useStigContext();
    const [severities, setSeverities] = useState<Set<Severity>>(new Set());
    const [classificationLevel, setClassficationLevel] = useState(
        classification || Classification.Public
    );

    const classficationProfiles = useMemo(
        () => stig.profilesByClassification,
        [stig]
    );
    const groups = useMemo(
        () =>
            stig.groupsByProfiles(
                Object.values(classficationProfiles[classificationLevel]).flat()
            ),
        [stig, classficationProfiles]
    );

    const counts = useMemo(() => {
        const counts = {} as Record<Severity, number>;
        Object.values(groups).forEach((group) => {
            if (!counts[group.rule.severity]) {
                counts[group.rule.severity] = 0;
            }
            counts[group.rule.severity]++;
        });
        return Object.entries(counts).sort(([a], [b]) =>
            bySeverity(b as Severity, a as Severity)
        );
    }, [groups]);

    const tableBody = useMemo(
        () =>
            Object.values(groups)
                .filter((group) => {
                    if (severities.size === 0) {
                        return true;
                    }
                    return severities.has(group.rule.severity);
                })
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
                    classNames: [null, null, null, "max-lg:hidden"],
                })),
        [groups, stigId, severities]
    );

    const classifications = useMemo(() => Object.values(Classification), []);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Breadcrumbs stigId={stigId} />
            <h1 className="text-3xl mt-6">{stig.title}</h1>
            <p className="text-base discussion">{stig.description}</p>

            <section className="text-zinc-600 dark:text-zinc-500 text-xs w-full flex justify-between items-center">
                <aside
                    className="inline-flex rounded-md shadow-xs"
                    role="group"
                >
                    {classifications.map((classification, index) => (
                        <Button
                            key={classification}
                            stigId={stigId}
                            classfication={classification}
                            selectedClassfication={classificationLevel}
                            setClassficationLevel={setClassficationLevel}
                            index={index}
                        />
                    ))}
                </aside>
                <div className="text-zinc-600 dark:text-zinc-500 text-xs flex flex-col align-end text-end">
                    <span>Date: {stig.date}</span>
                    <span>Version: {stig.version}</span>
                </div>
            </section>

            <section className="w-full flex justify-between items-center">
                <div>
                    {counts.map(([severity, count]) => (
                        <SeverityBadge
                            key={severity}
                            severity={severity as Severity}
                            count={count}
                            Element="button"
                            selected={severities.has(severity as Severity)}
                            onClick={() => {
                                const newSeverities = new Set(severities);
                                if (newSeverities.has(severity as Severity)) {
                                    newSeverities.delete(severity as Severity);
                                } else {
                                    newSeverities.add(severity as Severity);
                                }
                                setSeverities(newSeverities);
                            }}
                        />
                    ))}
                </div>
                <div className="text-zinc-600 dark:text-zinc-500 text-xs flex">
                    <button
                        onClick={() =>
                            download(
                                `/data/stigs/schema/${stig.id}.xml`,
                                `${stig.id}.xml`
                            )
                        }
                        className="text-zinc-600 dark:text-zinc-500 text-xs flex flex-col mr-4"
                    >
                        XML
                    </button>
                    <button
                        onClick={() =>
                            download(
                                `/data/stigs/schema/${stig.id}.json`,
                                `${stig.id}.json`
                            )
                        }
                        className="text-zinc-600 dark:text-zinc-500 text-xs flex flex-col mr-4"
                    >
                        JSON
                    </button>
                    <button
                        onClick={() => toCSV(stig)}
                        className="text-zinc-600 dark:text-zinc-500 text-xs flex flex-col"
                    >
                        CSV
                    </button>
                </div>
            </section>

            <section className="w-full flex flex-col">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Table
                        sorters={sorters}
                        filters={filters}
                        tableHeaders={tableHeaders}
                        tableBody={tableBody}
                        initialOrders={[Order.ASC, Order.DESC, Order.NONE]}
                    />
                </div>
            </section>
        </Suspense>
    );
};
