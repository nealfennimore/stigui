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

    let nextClasses = "rounded-r-lg rounded-l-lg";
    if (previous) {
        nextClasses = "rounded-r-lg";
    }
    let prevClasses = "rounded-r-lg rounded-l-lg";
    if (next) {
        prevClasses = "rounded-l-lg border-r";
    }

    return (
        <aside className="w-5/6 flex flex-row mb-4">
            {previous && (
                <Link
                    href={makeUrl(stigId, previous)}
                    className={`flex flex-row items-center py-2 px-4 text-zinc-900 border-zinc-200 hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-zinc-700 dark:text-white dark:hover:text-white dark:h dark:border-zinc-700 dark:text-white dark:hover:text-white dark:hover:bg-zinc-700 dark:focus:ring-blue-500 dark:focus:text-white dark:bg-zinc-800 ${prevClasses}`}
                    tabIndex={10}
                    ref={previousRef}
                >
                    <svg
                        className="w-6 h-6 text-gray-500"
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
                    <span className="mr-4 ml-2">{previous.id}</span>
                </Link>
            )}
            {next && (
                <Link
                    href={makeUrl(stigId, next)}
                    className={`flex flex-row items-center py-2 px-4 text-zinc-900 border-zinc-200 hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-zinc-700 dark:text-white dark:hover:text-white dark:h dark:border-zinc-700 dark:text-white dark:hover:text-white dark:hover:bg-zinc-700 dark:focus:ring-blue-500 dark:focus:text-white dark:bg-zinc-800 ${nextClasses}`}
                    tabIndex={11}
                    ref={nextRef}
                >
                    <span className="ml-4 mr-2">{next.id}</span>
                    <svg
                        className="w-6 h-6 text-gray-500"
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
