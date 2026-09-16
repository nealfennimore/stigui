"use client";
import { plexMono, plexSans } from "@/app/components/client/editor/fonts";
import { Icon, IconName } from "@/app/components/client/editor/icons";
import { useImportChecklist } from "@/app/components/client/editor/import_cklb";
import {
    percentAssessed,
    StatusCounts,
} from "@/app/components/client/editor/progress";
import { getLastChecklistId } from "@/app/components/client/editor/workbench_state";
import { CommandPalette } from "@/app/components/command_palette";
import { Logo } from "@/app/components/ui/logo";
import { ThemeToggle } from "@/app/components/ui/theme";
import { APPNAME } from "@/app/constants";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export type NavKey = "stigs" | "checklists" | "workbench";

export type ShellAction = {
    label: string;
    icon: IconName;
    onClick: () => void;
    tone?: "default" | "danger";
};

type Props = {
    active: NavKey;
    /** The open checklist; makes the Workbench item point at it. */
    checklistId?: string;
    /** Progress card content. Hidden when no checklist is open. */
    progress?: { label: string; counts: StatusCounts };
    /** Enables "Export CKLB" in the Import / Export group. */
    onExport?: () => void;
    /** "This checklist" actions under the primary nav. */
    actions?: ShellAction[];
    children: React.ReactNode;
};

const navItemClasses = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
        active
            ? "bg-wb-nav-active font-semibold text-wb-nav-active-foreground"
            : "font-medium text-muted hover:bg-surface-muted hover:text-foreground"
    }`;

const NavLink = ({
    href,
    icon,
    label,
    active,
    disabled,
    title,
}: {
    href: string;
    icon: IconName;
    label: string;
    active: boolean;
    disabled?: boolean;
    title?: string;
}) => {
    const Glyph = Icon[icon];
    if (disabled) {
        return (
            <span
                aria-disabled="true"
                title={title}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-subtle/70 cursor-not-allowed"
            >
                <Glyph className="w-4 h-4 shrink-0" />
                {label}
            </span>
        );
    }
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            title={title}
            className={navItemClasses(active)}
        >
            <Glyph className="w-4 h-4 shrink-0" />
            {label}
        </Link>
    );
};

const SubItem = ({
    icon,
    label,
    onClick,
    disabled,
    title,
    tone = "default",
}: {
    icon: IconName;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    tone?: "default" | "danger";
}) => {
    const Glyph = Icon[icon];
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${
                tone === "danger"
                    ? "text-muted hover:bg-danger-surface hover:text-danger-foreground"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
        >
            <Glyph className="w-4 h-4 shrink-0" />
            {label}
        </button>
    );
};

const ProgressCard = ({
    label,
    counts,
}: {
    label: string;
    counts: StatusCounts;
}) => {
    const percent = percentAssessed(counts);
    const remaining = counts.total - counts.assessed;
    return (
        <div className="flex flex-col gap-2 rounded-[10px] bg-surface-muted px-2.5 py-3">
            <div className="flex items-center justify-between gap-2 text-[11.5px] text-muted">
                <span className="truncate" title={label}>
                    {label}
                </span>
                <span className="font-semibold text-foreground">
                    {percent}%
                </span>
            </div>
            <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-label="Rules reviewed"
                className="h-1.5 overflow-hidden rounded-[3px] bg-border"
            >
                <div
                    className="h-full rounded-[3px] bg-accent transition-[width]"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-[11px] text-subtle">
                {remaining === 0
                    ? "All rules reviewed"
                    : `${remaining} rule${remaining === 1 ? "" : "s"} left to review`}
            </span>
        </div>
    );
};

/** Compact site footer for scrolling content pages inside the shell. */
export const WorkbenchFooter = () => (
    <footer className="mt-10 flex flex-col gap-1 border-t border-wb-divider pt-4 text-[11.5px] text-subtle">
        <span>
            Need a hand?{" "}
            <a
                href="https://getcmmc.consulting"
                className="font-medium text-muted hover:text-foreground hover:underline"
            >
                GetCMMC
            </a>{" "}
            offers senior-led CMMC 2.0 readiness &amp; NIST 800-171 consulting
            — mock assessments, gap analysis, and SSP/POA&amp;M development.
        </span>
        <span>
            © 2026{" "}
            <a
                href="https://neal.codes"
                className="hover:text-foreground hover:underline"
            >
                neal.codes
            </a>{" "}
            All Rights Reserved.
        </span>
    </footer>
);

/**
 * Scrolling content column for list pages (STIGs, Checklists). Sits
 * beside the side nav and centers its children at a readable width.
 */
export const WorkbenchContent = ({
    children,
    footer = true,
    wide = false,
    className = "",
}: {
    children: React.ReactNode;
    footer?: boolean;
    /** Wider column for pages with multi-column tables. */
    wide?: boolean;
    className?: string;
}) => (
    <div className="wb-scroll min-w-0 flex-1 px-4 py-6 lg:overflow-y-auto lg:px-[26px]">
        <div
            className={`mx-auto flex w-full flex-col gap-4 ${
                wide ? "max-w-6xl" : "max-w-4xl"
            } ${className}`.trim()}
        >
            {children}
            {footer && <WorkbenchFooter />}
        </div>
    </div>
);

/**
 * Full-viewport frame for the checklist editor: a 212px side nav plus
 * whatever columns the page renders as children. Below `lg` the nav
 * collapses to a top bar and children stack.
 */
export const WorkbenchShell = ({
    active,
    checklistId,
    progress,
    onExport,
    actions,
    children,
}: Props) => {
    const [lastChecklistId, setLastChecklistId] = useState<string | null>(
        null
    );
    const [transferOpen, setTransferOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importChecklist = useImportChecklist();

    useEffect(() => {
        setLastChecklistId(getLastChecklistId());
    }, [checklistId]);

    const workbenchId = checklistId ?? lastChecklistId;
    const workbenchHref = workbenchId ? `/editor?id=${workbenchId}` : "#";

    const onImportChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        setTransferOpen(false);
        if (file) {
            await importChecklist(file);
        }
    };

    const primaryNav = (
        <>
            <NavLink
                href="/stigs"
                icon="library"
                label="STIGs"
                active={active === "stigs"}
            />
            <NavLink
                href="/editor"
                icon="checklists"
                label="Checklists"
                active={active === "checklists"}
            />
            <NavLink
                href={workbenchHref}
                icon="workbench"
                label="Workbench"
                active={active === "workbench"}
                disabled={!workbenchId}
                title={
                    workbenchId
                        ? "Review the open checklist"
                        : "Open a checklist to start reviewing"
                }
            />
        </>
    );

    return (
        <div
            className={`workbench ${plexSans.variable} ${plexMono.variable} flex min-h-screen flex-col bg-canvas font-plex text-[13px] text-wb-text antialiased lg:h-screen lg:flex-row lg:overflow-hidden`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".cklb,application/json"
                className="hidden"
                aria-label="Import CKLB file"
                onChange={onImportChange}
            />

            {/* Compact top bar below lg. */}
            <header className="flex items-center gap-2 border-b border-wb-divider bg-surface px-3 py-2 lg:hidden">
                <Link
                    href="/"
                    className="flex items-center gap-2 pr-2 text-[14.5px] font-bold tracking-[-0.01em] text-foreground"
                >
                    <Logo className="w-7" />
                    {APPNAME}
                </Link>
                <nav className="flex items-center gap-0.5 overflow-x-auto">
                    {primaryNav}
                </nav>
                <div className="ml-auto flex items-center gap-0.5">
                    {actions?.map((action) => {
                        const Glyph = Icon[action.icon];
                        return (
                            <button
                                key={action.label}
                                type="button"
                                onClick={action.onClick}
                                aria-label={action.label}
                                title={action.label}
                                className={`rounded-lg p-2 transition-colors ${
                                    action.tone === "danger"
                                        ? "text-muted hover:bg-danger-surface hover:text-danger-foreground"
                                        : "text-muted hover:bg-surface-muted hover:text-foreground"
                                }`}
                            >
                                <Glyph className="w-4 h-4" />
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Import CKLB"
                        title="Import CKLB"
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                        <Icon.upload className="w-4 h-4" />
                    </button>
                    {onExport && (
                        <button
                            type="button"
                            onClick={onExport}
                            aria-label="Export CKLB"
                            title="Export CKLB"
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <Icon.download className="w-4 h-4" />
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            {/* Side nav at lg and up. */}
            <aside className="hidden w-[212px] shrink-0 flex-col gap-0.5 border-r border-wb-divider bg-surface px-3 py-4 lg:flex">
                <Link
                    href="/"
                    className="flex items-center gap-[9px] px-2 pb-3 pt-1 text-[14.5px] font-bold tracking-[-0.01em] text-foreground"
                >
                    <Logo className="w-7 shrink-0" />
                    {APPNAME}
                </Link>

                <CommandPalette
                    slashShortcut={active === "stigs"}
                    className="mb-3 flex w-full items-center gap-2 rounded-[10px] border border-border bg-canvas px-3 py-2 text-[12px] text-subtle shadow-wb-card transition-colors hover:border-border-strong hover:text-foreground dark:shadow-none [&>kbd]:ml-auto [&>span]:flex-1 [&>span]:text-left"
                />

                <nav aria-label="Primary" className="flex flex-col gap-0.5">
                    {primaryNav}
                    <button
                        type="button"
                        aria-expanded={transferOpen}
                        onClick={() => setTransferOpen((open) => !open)}
                        className={navItemClasses(false)}
                    >
                        <Icon.transfer className="w-4 h-4 shrink-0" />
                        Import / Export
                        <Icon.chevronDown
                            className={`ml-auto h-3.5 w-3.5 text-subtle transition-transform ${
                                transferOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                    {transferOpen && (
                        <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2">
                            <SubItem
                                icon="upload"
                                label="Import CKLB…"
                                onClick={() => fileInputRef.current?.click()}
                            />
                            <SubItem
                                icon="download"
                                label="Export CKLB"
                                onClick={() => {
                                    setTransferOpen(false);
                                    onExport?.();
                                }}
                                disabled={!onExport}
                                title={
                                    onExport
                                        ? "Download this checklist for STIG Viewer 3"
                                        : "Open a checklist to export it"
                                }
                            />
                        </div>
                    )}
                </nav>

                {actions && actions.length > 0 && (
                    <section
                        aria-label="This checklist"
                        className="mt-4 flex flex-col gap-0.5"
                    >
                        <h2 className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-[.07em] text-subtle">
                            This checklist
                        </h2>
                        {actions.map((action) => (
                            <SubItem
                                key={action.label}
                                icon={action.icon}
                                label={action.label}
                                onClick={action.onClick}
                                tone={action.tone}
                            />
                        ))}
                    </section>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-4">
                    {progress && (
                        <ProgressCard
                            label={progress.label}
                            counts={progress.counts}
                        />
                    )}
                    <div className="flex items-center justify-between px-1 pt-1">
                        <a
                            href="https://github.com/nealfennimore/stig"
                            aria-label="GitHub repository"
                            className="rounded-md p-2 text-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <Icon.github className="w-4 h-4" />
                        </a>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            {children}
        </div>
    );
};
