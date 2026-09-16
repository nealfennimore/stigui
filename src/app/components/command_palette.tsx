"use client";

import { ManifestStore } from "@/api/entities/Manifest";
import { ManifestContext } from "@/app/context/manifest";
import { getRecent, recordView, RecentStig } from "@/app/recently_viewed";
import { useRouter } from "next/navigation";
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

type Result = {
    id: string;
    title: string;
    version?: string;
    date?: string;
};

const score = (element: { id: string; title: string }, needle: string) => {
    const title = element.title.toLocaleLowerCase();
    const id = element.id.toLocaleLowerCase();
    if (title.startsWith(needle) || id.startsWith(needle)) {
        return 3;
    }
    if (
        title.includes(` ${needle}`) ||
        id.includes(`_${needle}`) ||
        id.includes(`-${needle}`)
    ) {
        return 2;
    }
    if (title.includes(needle) || id.includes(needle)) {
        return 1;
    }
    return 0;
};

const LIMIT = 15;

export const CommandPalette = ({
    className = "inline-flex items-center gap-2 rounded-md p-2 md:px-3 md:py-1.5 text-sm text-muted hover:bg-surface-muted hover:text-foreground transition-colors md:border md:border-border-strong",
    slashShortcut = true,
}: {
    /** Trigger button classes; the default matches the site header. */
    className?: string;
    /** Whether a bare "/" opens the palette (off where a page owns "/"). */
    slashShortcut?: boolean;
}) => {
    const manifestPromise = useContext(ManifestContext);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [store, setStore] = useState<ManifestStore | null>(null);
    const [recents, setRecents] = useState<RecentStig[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Resolve the manifest lazily on first open; never suspend the nav.
    useEffect(() => {
        if (isOpen && !store && manifestPromise) {
            manifestPromise.then(setStore).catch(() => {});
        }
    }, [isOpen, store, manifestPromise]);

    useEffect(() => {
        if (isOpen) {
            setRecents(getRecent());
            setQuery("");
            setActiveIndex(0);
            // Focus after the overlay renders.
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [isOpen]);

    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();
                setIsOpen((open) => !open);
                return;
            }
            if (event.key === "/" && slashShortcut && !isOpen) {
                const target = event.target as HTMLElement | null;
                if (
                    target?.isContentEditable ||
                    ["INPUT", "TEXTAREA", "SELECT"].includes(
                        target?.tagName ?? ""
                    )
                ) {
                    return;
                }
                event.preventDefault();
                setIsOpen(true);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, slashShortcut]);

    const results: Result[] = useMemo(() => {
        const needle = query.trim().toLocaleLowerCase();
        if (!needle) {
            const known = new Set(
                (store?.elements ?? []).map((element) => element.id)
            );
            return recents
                .filter((recent) => !store || known.has(recent.id))
                .map(({ id, title }) => ({ id, title }));
        }
        return (store?.elements ?? [])
            .map((element) => ({ element, rank: score(element, needle) }))
            .filter(({ rank }) => rank > 0)
            .sort(
                (a, b) =>
                    b.rank - a.rank ||
                    a.element.title.localeCompare(b.element.title)
            )
            .slice(0, LIMIT)
            .map(({ element }) => ({
                id: element.id,
                title: element.title,
                version: element.version,
                date: element.date,
            }));
    }, [query, store, recents]);

    const select = useCallback(
        (result: Result) => {
            recordView(result.id, result.title);
            close();
            router.push(`/stigs/${result.id}`);
        },
        [close, router]
    );

    const onInputKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActiveIndex((index) =>
                    Math.min(index + 1, results.length - 1)
                );
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
                break;
            case "Enter":
                event.preventDefault();
                if (results[activeIndex]) {
                    select(results[activeIndex]);
                }
                break;
            case "Escape":
                close();
                break;
        }
    };

    return (
        <>
            <button
                type="button"
                aria-label="Search STIGs"
                onClick={() => setIsOpen(true)}
                className={className}
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
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="max-md:hidden">Search…</span>
                <kbd className="max-md:hidden inline-flex items-center rounded border border-border-strong px-1.5 py-0.5 text-[10px] font-medium text-subtle">
                    Ctrl K
                </kbd>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
                    role="presentation"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            close();
                        }
                    }}
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-black/50 -z-10"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search STIGs"
                        className="w-full max-w-xl rounded-lg border border-border bg-surface shadow-overlay overflow-hidden"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            role="combobox"
                            aria-expanded="true"
                            aria-controls="command-palette-results"
                            aria-activedescendant={
                                results[activeIndex]
                                    ? `palette-result-${results[activeIndex].id}`
                                    : undefined
                            }
                            placeholder="Search STIGs…"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setActiveIndex(0);
                            }}
                            onKeyDown={onInputKeyDown}
                            className="w-full px-4 py-3 text-sm bg-surface text-foreground placeholder:text-subtle border-b border-border focus:outline-none"
                        />
                        <ul
                            id="command-palette-results"
                            role="listbox"
                            className="max-h-80 overflow-y-auto py-1"
                        >
                            {!query && results.length > 0 && (
                                <li
                                    aria-hidden="true"
                                    className="px-4 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-subtle"
                                >
                                    Recently viewed
                                </li>
                            )}
                            {results.length === 0 && (
                                <li className="px-4 py-6 text-sm text-muted text-center">
                                    {query
                                        ? `No STIGs match "${query}"`
                                        : "Type to search the STIG catalog"}
                                </li>
                            )}
                            {results.map((result, index) => (
                                <li
                                    key={result.id}
                                    id={`palette-result-${result.id}`}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                >
                                    <button
                                        type="button"
                                        onClick={() => select(result)}
                                        onMouseMove={() =>
                                            setActiveIndex(index)
                                        }
                                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                                            index === activeIndex
                                                ? "bg-accent-subtle text-foreground"
                                                : "text-muted"
                                        }`}
                                    >
                                        <span className="text-sm truncate">
                                            {result.title}
                                        </span>
                                        {result.version && (
                                            <span className="text-xs text-subtle whitespace-nowrap">
                                                v{result.version} ·{" "}
                                                {result.date}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};
