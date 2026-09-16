"use client";

import { GroupWrapper } from "@/api/entities/Stig";
import { RuleText } from "@/app/components/rule_text";
import React, { useEffect, useState } from "react";

const icons = {
    discussion: (
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </svg>
    ),
    check: (
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
    ),
    fix: (
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
            <path d="M14.7 6.3a4.5 4.5 0 0 0-6.09 5.74L3 17.65V21h3.35l5.61-5.61A4.5 4.5 0 0 0 17.7 9.3l-2.87 2.87-2.12-2.12z" />
        </svg>
    ),
};

const CopyButton = ({ text, label }: { text: string; label: string }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }
        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <button
            type="button"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                } catch {
                    // Clipboard unavailable (permissions, insecure context).
                }
            }}
            className="inline-flex items-center gap-1 normal-case tracking-normal font-medium text-xs text-subtle hover:text-foreground transition-colors"
        >
            {copied ? (
                <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-success-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="m5 13 4 4L19 7" />
                </svg>
            ) : (
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
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
            )}
            {copied ? "Copied" : "Copy"}
            <span className="sr-only">{label}</span>
        </button>
    );
};

export const RulePanel = ({
    icon,
    title,
    text,
    copyable = false,
    compact = false,
}: {
    icon: keyof typeof icons;
    title: string;
    text: string;
    copyable?: boolean;
    compact?: boolean;
}) => (
    <section className="w-full flex flex-col">
        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
            <h3
                className={`flex items-center justify-between gap-3 text-xs font-semibold tracking-wide uppercase text-muted bg-surface-muted border-b border-border ${
                    compact ? "px-4 py-2.5" : "px-6 py-3.5"
                }`}
            >
                <span className="inline-flex items-center gap-2">
                    {icons[icon]}
                    {title}
                </span>
                {copyable && <CopyButton text={text} label={`${title} text`} />}
            </h3>
            <div
                className={`text-sm text-foreground leading-relaxed flex flex-col gap-3 ${
                    compact ? "px-4 py-3" : "px-6 py-4"
                }`}
            >
                <RuleText text={text} />
            </div>
        </div>
    </section>
);

/** The three standard panels for a rule, shared by the detail page and
 *  the preview sidebar. */
export const GroupInfo = ({
    group,
    compact = false,
}: {
    group: GroupWrapper;
    compact?: boolean;
}) => (
    <>
        <RulePanel
            icon="discussion"
            title="Discussion"
            text={group.rule.description}
            compact={compact}
        />
        <RulePanel
            icon="check"
            title="Check"
            text={group.rule.check}
            copyable
            compact={compact}
        />
        <RulePanel
            icon="fix"
            title="Fix"
            text={group.rule.fixText}
            copyable
            compact={compact}
        />
    </>
);
