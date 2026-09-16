"use client";
import { Checklist, Convert } from "@/api/generated/Checklist";
import {
    computeStatusCounts,
    ProgressBar,
} from "@/app/components/client/editor/progress";
import {
    defaultFilter,
    defaultSort,
    Order,
    Table,
} from "@/app/components/table";
import { buttonClasses } from "@/app/components/ui/button";
import { TableCard } from "@/app/components/ui/card";
import { useConfirm } from "@/app/components/ui/confirm_dialog";
import { EmptyState } from "@/app/components/ui/empty_state";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { useToast } from "@/app/components/ui/toast";
import { IDB } from "@/app/db";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const sorters = [defaultSort, null, defaultSort, null];
const filters = [defaultFilter, null, null, null];

const ImportButton = ({
    fileInputRef,
    onImport,
    primary = false,
}: {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    primary?: boolean;
}) => (
    <>
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
                variant: primary ? "primary" : "secondary",
                size: "sm",
            })}
        >
            Import CKLB
        </button>
    </>
);

export const ChecklistsView = () => {
    const [checklists, setChecklists] = useState<Checklist[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const confirm = useConfirm();
    const { toast } = useToast();
    const router = useRouter();

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
            toast({
                tone: "success",
                title: "Checklist imported",
                description: `Opening "${checklist.title}"…`,
            });
            router.push(`/editor?id=${checklist.id}`);
        } catch (err) {
            console.error(err);
            toast({
                tone: "danger",
                title: "Import failed",
                description:
                    "Could not import that file. Make sure it is a valid .cklb checklist.",
            });
        }
    };

    const removeChecklist = async (checklist: Checklist) => {
        const confirmed = await confirm({
            title: "Delete checklist?",
            description: `"${checklist.title}" will be deleted from this browser. This cannot be undone.`,
            tone: "danger",
            confirmLabel: "Delete",
        });
        if (!confirmed) {
            return;
        }
        await IDB.removeChecklist(checklist.id);
        setChecklists(
            (prev) => prev?.filter((c) => c.id !== checklist.id) ?? null
        );
    };

    const tableHeaders = useMemo(
        () => [
            {
                text: "Title",
            },
            {
                text: "Progress",
                className: "w-48 max-sm:w-28",
            },
            {
                text: "STIGs",
                className: "text-center max-md:hidden",
            },
            {
                text: "",
            },
        ],
        []
    );

    const tableBody = useMemo(
        () =>
            checklists?.map((checklist) => {
                const rules = checklist.stigs.flatMap((stig) => stig.rules);
                const progress = computeStatusCounts(rules);
                const percent =
                    progress.total === 0
                        ? 0
                        : Math.round(
                              (progress.assessed / progress.total) * 100
                          );
                return {
                    onClick: () =>
                        router.push(`/editor?id=${checklist.id}`),
                    values: [
                        checklist.title,
                        String(percent),
                        String(checklist.stigs.length),
                        "",
                    ],
                    columns: [
                        <Link
                            className="flex flex-col font-medium text-accent hover:underline"
                            href={`/editor?id=${checklist.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {checklist.title}
                        </Link>,
                        <span className="flex flex-col gap-1">
                            <ProgressBar progress={progress} size="sm" />
                            <span className="text-xs text-subtle">
                                {progress.assessed}/{progress.total} assessed
                            </span>
                        </span>,
                        String(checklist.stigs.length),
                        <button
                            type="button"
                            aria-label="Delete checklist"
                            title="Delete checklist"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeChecklist(checklist);
                            }}
                            className="text-subtle hover:text-danger-foreground transition-colors"
                        >
                            <svg
                                aria-hidden="true"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>,
                    ],
                    classNames: [
                        null,
                        "w-48 max-sm:w-28",
                        "text-center max-md:hidden",
                        "text-right w-px",
                    ],
                };
            }) ?? [],
        [checklists] // eslint-disable-line react-hooks/exhaustive-deps
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
                {checklists && checklists.length > 0 && (
                    <ImportButton
                        fileInputRef={fileInputRef}
                        onImport={onImport}
                    />
                )}
            </div>

            {checklists === null && <SkeletonTable rows={3} />}

            {checklists?.length === 0 && (
                <EmptyState
                    title="No checklists yet"
                    description="Build a checklist from any STIG with its Edit checklist button, or import an existing CKLB file from DISA STIG Viewer."
                    action={
                        <>
                            <Link
                                href="/stigs"
                                className={buttonClasses({
                                    variant: "primary",
                                    size: "sm",
                                })}
                            >
                                Browse STIGs
                            </Link>
                            <ImportButton
                                fileInputRef={fileInputRef}
                                onImport={onImport}
                            />
                        </>
                    }
                />
            )}

            {!!checklists?.length && (
                <TableCard>
                    <Table
                        sorters={sorters}
                        filters={filters}
                        tableHeaders={tableHeaders}
                        tableBody={tableBody}
                        initialOrders={[
                            Order.ASC,
                            Order.NONE,
                            Order.NONE,
                            Order.NONE,
                        ]}
                        formRef={null}
                        caption="Saved checklists"
                        mobile={{ primaryColumn: 0 }}
                    />
                </TableCard>
            )}
        </section>
    );
};
