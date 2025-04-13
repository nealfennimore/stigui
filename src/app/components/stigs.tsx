"use client";
import { Table, defaultFilter, defaultSort } from "@/app/components/table";
import { useManifestContext } from "@/app/context/manifest";
import Link from "next/link";
import { useMemo } from "react";

const sorters = [defaultSort, defaultSort, defaultSort];
const filters = [defaultFilter, null, null];

export const Stigs = () => {
    const manifest = useManifestContext();
    if (!manifest.elements?.length) {
        return null;
    }

    const tableHeaders = useMemo(
        () => [
            {
                text: "STIG",
                filterable: true,
            },
            {
                text: "Version",
                filterable: false,
                className: "text-center",
            },
            {
                text: "Date",
                filterable: false,
                className: "max-md:hidden",
            },
        ],
        []
    );

    const tableBody = useMemo(
        () =>
            manifest.elements.map((element) => ({
                values: [element.title, element.version, element.date],
                columns: [
                    <Link
                        className="flex flex-col"
                        href={`/stigs/${element.id}`}
                    >
                        {element.title}
                    </Link>,
                    element.version,
                    element.date,
                ],
                classNames: [null, "text-center", "max-md:hidden"],
            })),
        [manifest.elements]
    );

    return (
        <>
            <section className="w-full flex flex-col">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Table
                        sorters={sorters}
                        filters={filters}
                        tableHeaders={tableHeaders}
                        tableBody={tableBody}
                    />
                </div>
            </section>
        </>
    );
};
