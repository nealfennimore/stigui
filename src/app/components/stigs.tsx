"use client";
import {
    defaultFilter,
    defaultSort,
    Order,
    Table,
} from "@/app/components/table";
import { TableCard } from "@/app/components/ui/card";
import { useManifestContext } from "@/app/context/manifest";
import Link from "next/link";
import { useMemo, useRef } from "react";

const sorters = [defaultSort, defaultSort, defaultSort];
const filters = [defaultFilter, null, null];

export const Stigs = () => {
    const manifest = useManifestContext();
    const formRef = useRef<HTMLFormElement>(null);
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
                        className="flex flex-col font-medium text-foreground hover:text-accent transition-colors"
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
        <section className="w-full flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Security Technical Implementation Guides
                </h1>
                <p className="text-sm text-muted mt-1">
                    Browse and search available STIGs.
                </p>
            </div>
            <TableCard>
                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    <Table
                        sorters={sorters}
                        filters={filters}
                        tableHeaders={tableHeaders}
                        tableBody={tableBody}
                        initialOrders={[Order.ASC, Order.NONE, Order.NONE]}
                        formRef={formRef}
                    />
                </form>
            </TableCard>
        </section>
    );
};
