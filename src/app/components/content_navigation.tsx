"use client";
import { GroupWrapper } from "@/api/entities/Stig";
import { isEditingTarget } from "@/app/hooks/use_keyboard_nav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ContentNavigationProps {
    stigId: string;
    previous?: GroupWrapper;
    next?: GroupWrapper;
    /** 0-based position of the current rule, for "Rule N of M". */
    index?: number;
    total?: number;
    /** Register ←/→ shortcuts. Enable on only one instance per page. */
    withKeyboard?: boolean;
    slim?: boolean;
}

const makeUrl = (stigId: string, group: GroupWrapper) =>
    `/stigs/${stigId}/groups/${group.id}`;

export const ContentNavigation = ({
    stigId,
    previous,
    next,
    index,
    total,
    withKeyboard = false,
    slim = false,
}: ContentNavigationProps) => {
    const router = useRouter();

    useEffect(() => {
        if (!withKeyboard) {
            return;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (isEditingTarget(event)) {
                return;
            }
            if (event.key === "ArrowLeft" && previous) {
                router.push(makeUrl(stigId, previous));
            } else if (event.key === "ArrowRight" && next) {
                router.push(makeUrl(stigId, next));
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [withKeyboard, previous, next, stigId, router]);

    const linkClasses =
        "flex max-w-[45%] flex-row items-center gap-2 rounded-[9px] border border-border bg-surface px-3.5 py-2 text-xs font-medium text-wb-body shadow-wb-card transition-colors hover:border-border-strong hover:bg-surface-muted dark:shadow-none";

    const position =
        index !== undefined && total !== undefined ? (
            <span className="self-center text-[11px] text-subtle whitespace-nowrap">
                Rule {index + 1} of {total}
            </span>
        ) : (
            <span />
        );

    return (
        <aside
            aria-label="Rule navigation"
            className="flex w-full flex-row items-stretch justify-between gap-3"
        >
            {previous ? (
                <Link href={makeUrl(stigId, previous)} className={linkClasses}>
                    <svg
                        className="w-4 h-4 shrink-0 text-subtle"
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
                    <span className="flex flex-col items-start overflow-hidden">
                        <span className="font-plex-mono text-[11.5px] font-semibold text-muted">
                            {previous.id}
                        </span>
                        {!slim && (
                            <span className="w-full truncate text-[11px] font-normal text-subtle">
                                {previous.rule.title}
                            </span>
                        )}
                    </span>
                </Link>
            ) : (
                <span />
            )}
            {position}
            {next ? (
                <Link
                    href={makeUrl(stigId, next)}
                    className={`${linkClasses} text-right`}
                >
                    <span className="flex flex-col items-end overflow-hidden">
                        <span className="font-plex-mono text-[11.5px] font-semibold text-muted">
                            {next.id}
                        </span>
                        {!slim && (
                            <span className="w-full truncate text-[11px] font-normal text-subtle">
                                {next.rule.title}
                            </span>
                        )}
                    </span>
                    <svg
                        className="w-4 h-4 shrink-0 text-subtle"
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
            ) : (
                <span />
            )}
        </aside>
    );
};
