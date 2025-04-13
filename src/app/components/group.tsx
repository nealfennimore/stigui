"use client";
import { SeverityBadge } from "@/app/components/severity";
import { useStigContext } from "@/app/context/stig";
import { Breadcrumbs } from "./breadcrumbs";
import { Table } from "./table";

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
                <h1 className="text-3xl my-6">{group.rule.title}</h1>
                <div className="relative overflow-x-auto shadow-sm sm:rounded-lg">
                    <Table
                        sorters={[]}
                        tableHeaders={[
                            {
                                text: "Severity",
                            },
                            {
                                text: "Group ID",
                            },
                            {
                                text: "Group Title",
                            },
                            {
                                text: "Version",
                            },
                            {
                                text: "Rule ID",
                            },
                            {
                                text: "Date",
                            },
                            {
                                text: "STIG Version",
                            },
                        ]}
                        tableBody={[
                            {
                                values: [
                                    group.rule.severity,
                                    group.id,
                                    group.title,
                                    group.rule.version,
                                    group.rule.id,
                                    stig.date.toLocaleDateString("sv-SE"),
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
                                    stig.date.toLocaleDateString("sv-SE"),
                                    stig.version,
                                ],
                            },
                        ]}
                    />
                </div>
            </section>
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
};
