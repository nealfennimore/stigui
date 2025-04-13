"use client";
import { Table, defaultFilter, defaultSort } from "@/app/components/table";
import { useManifestContext } from "@/app/context/manifest";
import Link from "next/link";

const sorters = [defaultSort, defaultSort, defaultSort];
const filters = [defaultFilter, null, null];

export const Stigs = () => {
    const manifest = useManifestContext();
    if (!manifest.elements?.length) {
        return null;
    }

    return (
        <>
            <section className="w-full flex flex-col">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Table
                        sorters={sorters}
                        filters={filters}
                        tableHeaders={[
                            {
                                text: "STIG",
                            },
                            {
                                text: "Version",
                            },
                            {
                                text: "Date",
                            },
                        ]}
                        tableBody={manifest.elements.map((element) => ({
                            values: [
                                element.title,
                                element.version,
                                element.date,
                            ],
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
                        }))}
                    />
                </div>
            </section>
        </>
    );
};
