"use client";
import { Checklist } from "@/api/generated/Checklist";
import {
    defaultFilter,
    defaultSort,
    Order,
    Table,
} from "@/app/components/table";
import { TableCard } from "@/app/components/ui/card";
import { IDB } from "@/app/db";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const sorters = [defaultSort, defaultSort, defaultSort];
const filters = [null, defaultFilter, null];

export const ChecklistsView = () => {
    const [checklists, setChecklists] = useState<Checklist[] | null>(null);

    useEffect(() => {
        (async () => {
            const checklistRecords = await IDB.checklists.getAll();
            const checklists = await Promise.all(
                checklistRecords.map(
                    (checklist) =>
                        IDB.exportChecklist(checklist.id) as Promise<Checklist>
                )
            );

            setChecklists(checklists);
        })();
    }, []);

    const tableHeaders = useMemo(
        () => [
            {
                text: "ID",
                filterable: false,
            },
            {
                text: "Title",
                filterable: true,
                className: "text-center",
            },
            {
                text: "CKLB Version",
                filterable: false,
                className: "max-md:hidden",
            },
        ],
        []
    );

    const tableBody = useMemo(
        () =>
            checklists?.map((checklist) => ({
                values: [checklist.id, checklist.title, checklist.cklb_version],
                columns: [
                    <Link
                        className="flex flex-col font-medium text-accent hover:underline"
                        href={`/editor?id=${checklist.id}`}
                    >
                        {checklist.id}
                    </Link>,
                    checklist.title,
                    checklist.cklb_version,
                ],
                classNames: [null, null, null],
            })) ?? [],
        [checklists]
    );

    return (
        <section className="w-full flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Checklists
                </h1>
                <p className="text-sm text-muted mt-1">
                    Saved checklists stored in your browser.
                </p>
            </div>
            <TableCard>
                <Table
                    sorters={sorters}
                    filters={filters}
                    tableHeaders={tableHeaders}
                    tableBody={tableBody}
                    initialOrders={[Order.NONE, Order.NONE, Order.NONE]}
                    formRef={null}
                />
            </TableCard>
        </section>
    );
};
