"use client";
import { GroupWrapper } from "@/api/entities/Stig";
import Link from "next/link";
import { useRef } from "react";

interface ContentNavigationProps {
    stigId: string;
    previous?: GroupWrapper;
    next?: GroupWrapper;
}

const makeUrl = (stigId: string, group: GroupWrapper) =>
    `/stigs/${stigId}/groups/${group.id}`;

export const ContentNavigation = ({
    stigId,
    previous,
    next,
}: ContentNavigationProps) => {
    const previousRef = useRef<HTMLAnchorElement>(null);
    const nextRef = useRef<HTMLAnchorElement>(null);

    const linkClasses =
        "flex flex-row items-center gap-2 py-2 px-4 text-sm font-medium text-foreground bg-surface border border-border-strong rounded-md hover:bg-surface-muted hover:text-accent transition-colors";

    return (
        <aside className="w-full flex flex-row justify-between gap-3 mb-4">
            {previous ? (
                <Link
                    href={makeUrl(stigId, previous)}
                    className={linkClasses}
                    tabIndex={10}
                    ref={previousRef}
                >
                    <svg
                        className="w-5 h-5 text-subtle"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        ></path>
                    </svg>
                    <span>{previous.id}</span>
                </Link>
            ) : (
                <span />
            )}
            {next && (
                <Link
                    href={makeUrl(stigId, next)}
                    className={linkClasses}
                    tabIndex={11}
                    ref={nextRef}
                >
                    <span>{next.id}</span>
                    <svg
                        className="w-5 h-5 text-subtle"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Link>
            )}
        </aside>
    );
};
