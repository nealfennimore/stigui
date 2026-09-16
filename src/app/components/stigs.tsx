"use client";
import { defaultSort, Order, Table } from "@/app/components/table";
import { TableCard } from "@/app/components/ui/card";
import { EmptyState } from "@/app/components/ui/empty_state";
import { Input } from "@/app/components/ui/field";
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
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
                Recently viewed
            </h2>
            <ul className="flex flex-wrap gap-2">
                {recents.map((recent) => (
                    <li key={recent.id}>
                        <Link
                            href={`/stigs/${recent.id}`}
                            className="inline-flex max-w-xs items-center rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted shadow-card hover:bg-surface-muted hover:text-foreground transition-colors"
                        >
                            <span className="truncate">{recent.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};

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
                    title="No STIGs available"
                    description="The STIG catalog could not be loaded. Try reloading the page."
                />
            </section>
        );
    }

    return (
        <section className="w-full flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Security Technical Implementation Guides
                </h1>
                <p className="text-sm text-muted mt-1">
                    Browse the catalog of Security Technical Implementation
                    Guides (STIGs) — the configuration standards used to harden
                    systems against security risks. Open a guide to review its
                    requirements by severity and classification, export it, or
                    build a checklist.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="relative">
                    <svg
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <Input
                        type="search"
                        aria-label="Search STIGs"
                        placeholder="Search STIGs by title or id…"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="pl-9 pr-16 py-2.5"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 rounded border border-border-strong px-1.5 py-0.5 text-[10px] font-medium text-subtle">
                        Ctrl K
                    </kbd>
                </div>
                <p className="text-xs text-subtle" role="status">
                    {elements.length} of {manifest.elements.length} STIGs
                </p>
            </div>

            {!query && <RecentlyViewed recents={recents} />}

            {elements.length === 0 ? (
                <EmptyState
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
                <TableCard>
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
