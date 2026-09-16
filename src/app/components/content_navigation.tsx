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
        "flex flex-row items-center gap-2 py-2 px-4 text-sm font-medium text-foreground bg-surface border border-border-strong rounded-md hover:bg-surface-muted hover:text-accent transition-colors max-w-[45%]";

    const position =
        index !== undefined && total !== undefined ? (
            <span className="self-center text-xs text-subtle whitespace-nowrap">
                Rule {index + 1} of {total}
            </span>
        ) : (
            <span />
        );

    return (
        <aside
            aria-label="Rule navigation"
            className="w-full flex flex-row justify-between items-stretch gap-3 mb-4"
        >
            {previous ? (
                <Link href={makeUrl(stigId, previous)} className={linkClasses}>
                    <svg
                        className="w-5 h-5 shrink-0 text-subtle"
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
                        <span>{previous.id}</span>
                        {!slim && (
                            <span className="text-xs text-subtle font-normal truncate w-full">
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
                        <span>{next.id}</span>
                        {!slim && (
                            <span className="text-xs text-subtle font-normal truncate w-full">
                                {next.rule.title}
                            </span>
                        )}
                    </span>
                    <svg
                        className="w-5 h-5 shrink-0 text-subtle"
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
