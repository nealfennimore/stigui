"use client";
import { Icon } from "@/app/components/client/editor/icons";
import { defaultSort, Order, Table } from "@/app/components/table";
import { TableCard } from "@/app/components/ui/card";
import { EmptyState } from "@/app/components/ui/empty_state";
import { useManifestContext } from "@/app/context/manifest";
import { getRecent, RecentStig } from "@/app/recently_viewed";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const sorters = [defaultSort, defaultSort, defaultSort];

const RecentlyViewed = ({ recents }: { recents: RecentStig[] }) => {
    if (!recents.length) {
        return null;
    }
    return (
        <section aria-label="Recently viewed" className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[.07em] text-subtle">
                Recently viewed
            </h2>
            <ul className="flex flex-wrap gap-1.5">
                {recents.map((recent) => (
                    <li key={recent.id}>
                        <Link
                            href={`/stigs/${recent.id}`}
                            className="inline-flex max-w-xs items-center rounded-[20px] border border-border bg-surface px-[11px] py-1 text-[11.5px] font-medium text-muted shadow-wb-card transition-colors hover:border-border-strong hover:text-foreground dark:shadow-none"
                        >
                            <span className="truncate">{recent.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};

/** STIG catalog: search, recents and the sortable table. */
export const Stigs = () => {
    const manifest = useManifestContext();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [query, setQuery] = useState("");
    const [recents, setRecents] = useState<RecentStig[]>([]);

    // localStorage reads render only after mount to avoid hydration
    // mismatches with the server-rendered markup.
    useEffect(() => {
        setRecents(getRecent().slice(0, 5));
    }, []);

    const elements = useMemo(() => {
        const all = manifest.elements ?? [];
        const needle = query.trim().toLocaleLowerCase();
        if (!needle) {
            return all;
        }
        return all.filter(
            (element) =>
                element.title.toLocaleLowerCase().includes(needle) ||
                element.id.toLocaleLowerCase().includes(needle)
        );
    }, [manifest.elements, query]);

    const tableHeaders = useMemo(
        () => [
            {
                text: "STIG",
            },
            {
                text: "Version",
                className: "text-center",
            },
            {
                text: "Date",
                className: "max-md:hidden",
            },
        ],
        []
    );

    const tableBody = useMemo(
        () =>
            elements.map((element) => ({
                onClick: () => router.push(`/stigs/${element.id}`),
                values: [element.title, element.version, element.date],
                columns: [
                    <span className="flex flex-col gap-0.5">
                        <Link
                            className="font-medium text-foreground hover:text-accent transition-colors"
                            href={`/stigs/${element.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {element.title}
                        </Link>
                        {element.description && (
                            <span className="text-xs text-subtle line-clamp-1">
                                {element.description}
                            </span>
                        )}
                    </span>,
                    element.version,
                    element.date,
                ],
                classNames: [null, "text-center", "max-md:hidden"],
            })),
        [elements, router]
    );

    if (!manifest.elements?.length) {
        return (
            <section className="w-full flex flex-col gap-4">
                <EmptyState
                    className="bg-surface"
                    title="No STIGs available"
                    description="The STIG catalog could not be loaded. Try reloading the page."
                />
            </section>
        );
    }

    return (
        <section className="w-full flex flex-col gap-4">
            <div>
                <h1 className="text-[19px] font-bold tracking-[-0.015em] text-foreground">
                    Security Technical Implementation Guides
                </h1>
                <p className="mt-1 max-w-[72ch] text-[12.5px] leading-[1.6] text-muted [text-wrap:pretty]">
                    Browse the catalog of Security Technical Implementation
                    Guides (STIGs) — the configuration standards used to harden
                    systems against security risks. Open a guide to review its
                    requirements by severity and classification, export it, or
                    build a checklist.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-[9px] text-subtle shadow-wb-card transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-ring/40 dark:shadow-none">
                    <Icon.search className="h-4 w-4 shrink-0" />
                    <input
                        type="search"
                        aria-label="Search STIGs"
                        placeholder="Search STIGs by title or id…"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-subtle focus:outline-none"
                    />
                    <kbd className="hidden items-center rounded border border-border px-1.5 py-0.5 font-plex-mono text-[10px] font-medium text-subtle md:inline-flex">
                        Ctrl K
                    </kbd>
                </label>
                <p className="text-[11px] text-subtle" role="status">
                    {elements.length} of {manifest.elements.length} STIGs
                </p>
            </div>

            {!query && <RecentlyViewed recents={recents} />}

            {elements.length === 0 ? (
                <EmptyState
                    className="bg-surface"
                    title={`No STIGs match "${query}"`}
                    description="Check the spelling or search for a shorter term."
                    action={
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="text-sm font-medium text-accent hover:underline"
                        >
                            Clear search
                        </button>
                    }
                />
            ) : (
                <TableCard className="rounded-[14px] shadow-wb-card dark:shadow-none">
                    <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                        <Table
                            sorters={sorters}
                            tableHeaders={tableHeaders}
                            tableBody={tableBody}
                            initialOrders={[Order.ASC, Order.NONE, Order.NONE]}
                            formRef={formRef}
                            caption="STIG catalog"
                            mobile={{ primaryColumn: 0 }}
                        />
                    </form>
                </TableCard>
            )}
        </section>
    );
};
