"use client";
import { SeverityBadge } from "@/app/components/severity";
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
                <h1 className="text-3xl my-6">{group.rule.title}</h1>
                <div className="relative overflow-x-auto shadow-sm sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Severity
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Group ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Group Title
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Version
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Rule ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    STIG Version
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                key={`${group.id}`}
                                className="odd:bg-white odd:dark:bg-zinc-900 even:bg-zinc-50 even:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200"
                            >
                                <td className="px-6 py-4">
                                    <SeverityBadge
                                        severity={group.rule.severity}
                                    />
                                </td>
                                <td scope="row" className="px-6 py-4">
                                    {group.id}
                                </td>
                                <td scope="row" className="px-6 py-4">
                                    {group.title}
                                </td>
                                <td className="px-6 py-4 whitespace-pre-line">
                                    {group.rule.version}
                                </td>
                                <td className="px-6 py-4 whitespace-pre-line">
                                    {group.rule.id}
                                </td>
                                <td className="px-6 py-4 whitespace-pre-line">
                                    {stig.date.toLocaleDateString("sv-SE")}
                                </td>
                                <td className="px-6 py-4 whitespace-pre-line">
                                    {stig.version}
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
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                key={`${group.id}`}
                                className="even:bg-white even:dark:bg-zinc-900 odd:bg-zinc-50 odd:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200"
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
                                    Check
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                key={`${group.id}`}
                                className="even:bg-white even:dark:bg-zinc-900 odd:bg-zinc-50 odd:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200"
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
                                    Fix
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                key={`${group.id}`}
                                className="even:bg-white even:dark:bg-zinc-900 odd:bg-zinc-50 odd:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200"
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
