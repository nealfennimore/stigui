"use client";
import { GroupWrapper } from "@/api/entities/Stig";
import { ContentNavigation } from "@/app/components/content_navigation";
import { SeverityBadge } from "@/app/components/severity";
import { useStigContext } from "@/app/context/stig";
import { Suspense } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { Table } from "./table";

export const GroupInfo = ({ group }: { group: GroupWrapper }) => (
    <>
        <section className="w-full flex flex-col">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                    <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Description
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            key={`${group.id}`}
                            className="even:bg-white even:dark:bg-zinc-900 odd:bg-zinc-50 odd:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200 text-zinc-900 whitespace-nowrap dark:text-zinc-300 whitespace-pre-line"
                        >
                            <td className="px-6 py-4 whitespace-pre-line">
                                {group.rule.description}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
        <section className="w-full flex flex-col">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                    <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                ℹ️ Check
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            key={`${group.id}`}
                            className="even:bg-white even:dark:bg-zinc-900 odd:bg-zinc-50 odd:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200 text-zinc-900 whitespace-nowrap dark:text-zinc-300 whitespace-pre-line"
                        >
                            <td className="px-6 py-4 whitespace-pre-line">
                                {group.rule.check}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
        <section className="w-full flex flex-col">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                    <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                ✔️ Fix
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            key={`${group.id}`}
                            className="even:bg-white even:dark:bg-zinc-900 odd:bg-zinc-50 odd:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200 text-zinc-900 whitespace-nowrap dark:text-zinc-300 whitespace-pre-line"
                        >
                            <td className="px-6 py-4 whitespace-pre-line">
                                {group.rule.fixText}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </>
);

export const GroupView = ({
    stigId,
    groupId,
    classification,
}: {
    stigId: string;
    groupId: string;
    classification?: string;
}) => {
    const stig = useStigContext();
    const idx = stig.groups.findIndex((group) => group.id === groupId);
    const group = stig.groups[idx];

    if (!group) {
        return null;
    }

    return (
        <Suspense>
            <Breadcrumbs stigId={stigId} group={group} />

            <section className="w-full flex flex-col">
                <h1 className="text-3xl my-6">{group.rule.title}</h1>
                <div className="relative overflow-x-auto shadow-sm sm:rounded-lg">
                    <Table
                        tableHeaders={[
                            {
                                text: "Severity",
                            },
                            {
                                text: "Group ID",
                            },
                            {
                                text: "Group Title",
                                className: "max-md:hidden",
                            },
                            {
                                text: "Version",
                            },
                            {
                                text: "Rule ID",
                                className: "max-md:hidden",
                            },
                            {
                                text: "Date",
                                className: "max-lg:hidden",
                            },
                            {
                                text: "STIG Version",
                                className: "max-lg:hidden",
                            },
                        ]}
                        tableBody={[
                            {
                                classNames: [
                                    null,
                                    null,
                                    "max-md:hidden",
                                    null,
                                    "max-md:hidden",
                                    "max-lg:hidden",
                                    "max-lg:hidden",
                                ],
                                values: [
                                    group.rule.severity,
                                    group.id,
                                    group.title,
                                    group.rule.version,
                                    group.rule.id,
                                    stig.date,
                                    stig.version,
                                ],
                                columns: [
                                    <SeverityBadge
                                        severity={group.rule.severity}
                                    />,
                                    group.id,
                                    group.title,
                                    group.rule.version,
                                    group.rule.id,
                                    stig.date,
                                    stig.version,
                                ],
                            },
                        ]}
                    />
                </div>
            </section>
            <ContentNavigation
                stigId={stigId}
                previous={stig.groups[idx - 1]}
                next={stig.groups[idx + 1]}
            />
            <GroupInfo group={group} />
        </Suspense>
    );
};
