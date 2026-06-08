"use client";
import { Checklist, Convert } from "@/api/generated/Checklist";
import {
    defaultFilter,
    defaultSort,
    Order,
    Table,
} from "@/app/components/table";
import { buttonClasses } from "@/app/components/ui/button";
import { TableCard } from "@/app/components/ui/card";
import { IDB } from "@/app/db";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const sorters = [defaultSort, defaultSort, defaultSort, null];
const filters = [null, defaultFilter, null, null];

export const ChecklistsView = () => {
    const [checklists, setChecklists] = useState<Checklist[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-importing the same file
        if (!file) {
            return;
        }
        try {
            const checklist = Convert.toChecklist(await file.text());
            await IDB.importChecklist(checklist);
            const imported = (await IDB.exportChecklist(
                checklist.id
            )) as Checklist;
            setChecklists((prev) => [
                ...(prev ?? []).filter((c) => c.id !== imported.id),
                imported,
            ]);
        } catch (err) {
            console.error(err);
            window.alert(
                "Could not import that file. Make sure it is a valid .cklb checklist."
            );
        }
    };

    const removeChecklist = (checklist: Checklist) => {
        if (
            window.confirm(
                `Delete the checklist "${checklist.title}"? This cannot be undone.`
            )
        ) {
            (async () => {
                await IDB.removeChecklist(checklist.id);
                setChecklists(
                    (prev) =>
                        prev?.filter((c) => c.id !== checklist.id) ?? null
                );
            })();
        }
    };

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
            {
                text: "",
                filterable: false,
            },
        ],
        []
    );

    const tableBody = useMemo(
        () =>
            checklists?.map((checklist) => ({
                values: [
                    checklist.id,
                    checklist.title,
                    checklist.cklb_version,
                    "",
                ],
                columns: [
                    <Link
                        className="flex flex-col font-medium text-accent hover:underline"
                        href={`/editor?id=${checklist.id}`}
                    >
                        {checklist.id}
                    </Link>,
                    checklist.title,
                    checklist.cklb_version,
                    <button
                        type="button"
                        aria-label="Delete checklist"
                        title="Delete checklist"
                        onClick={() => removeChecklist(checklist)}
                        className="text-subtle hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                        🗑️
                    </button>,
                ],
                classNames: [null, null, null, "text-right w-px"],
            })) ?? [],
        [checklists]
    );

    return (
        <section className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Checklists
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        Saved checklists stored in your browser.
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".cklb,application/json"
                    className="hidden"
                    onChange={onImport}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={buttonClasses({
                        variant: "secondary",
                        size: "sm",
                    })}
                >
                    Import CKLB ⬆️
                </button>
            </div>
            <TableCard>
                <Table
                    sorters={sorters}
                    filters={filters}
                    tableHeaders={tableHeaders}
                    tableBody={tableBody}
                    initialOrders={[
                        Order.NONE,
                        Order.NONE,
                        Order.NONE,
                        Order.NONE,
                    ]}
                    formRef={null}
                />
            </TableCard>
        </section>
    );
};
