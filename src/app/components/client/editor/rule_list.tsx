"use client";
import { Rule, Severity, Status, Stig } from "@/api/generated/Checklist";
import { Icon } from "@/app/components/client/editor/icons";
import { computeStatusCounts } from "@/app/components/client/editor/progress";
import {
    FilterPill,
    RuleStatusPill,
    SEVERITY_LABEL,
    STATUS_LABEL,
} from "@/app/components/client/editor/rule_meta";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

type FilterCounts = {
    status: Record<Status, number>;
    severity: Record<Severity, number>;
    total: number;
};

type Props = {
    title: string;
    onTitleChange: (title: string) => void;
    query: string;
    onQueryChange: (query: string) => void;
    searchRef?: React.RefObject<HTMLInputElement>;
    statuses: Set<Status>;
    severities: Set<Severity>;
    onToggleStatus: (status: Status) => void;
    onToggleSeverity: (severity: Severity) => void;
    onClearFilters: () => void;
    counts: FilterCounts;
    stigs: Stig[];
    /** Filtered rules per STIG uuid, in display order. */
    visibleByStig: Map<string, Rule[]>;
    selectedUuid: string | null;
    selection: Set<string>;
    onSelectRule: (rule: Rule) => void;
    onToggleSelection: (uuid: string) => void;
    onSelectAll: (uuids: string[], selected: boolean) => void;
    onRemoveStig: (stig: Stig) => void;
};

const PRIMARY_STATUSES: Status[] = [Status.Open, Status.NotReviewed];
const EXTRA_STATUSES: Status[] = [Status.NotAFinding, Status.NotApplicable];
const PRIMARY_SEVERITIES: Severity[] = [Severity.High];
const EXTRA_SEVERITIES: Severity[] = [
    Severity.Medium,
    Severity.Low,
    Severity.Info,
];

const checkboxClasses =
    "h-3.5 w-3.5 shrink-0 rounded border-border-strong accent-accent";

const RuleCard = memo(function RuleCard({
    rule,
    selected,
    checked,
    onSelect,
    onToggle,
}: {
    rule: Rule;
    selected: boolean;
    checked: boolean;
    onSelect: (rule: Rule) => void;
    onToggle: (uuid: string) => void;
}) {
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (selected) {
            ref.current?.scrollIntoView({ block: "nearest" });
        }
    }, [selected]);

    return (
        <li
            ref={ref}
            aria-current={selected ? "true" : undefined}
            onClick={() => onSelect(rule)}
            className={`group cursor-pointer rounded-xl border px-3.5 py-3 transition-colors ${
                selected
                    ? "border-accent bg-wb-selected shadow-[0_0_0_0.5px_rgb(var(--accent)),0_2px_8px_rgba(40,80,160,.09)] dark:shadow-[0_0_0_0.5px_rgb(var(--accent))]"
                    : "border-border bg-surface shadow-wb-card hover:border-border-strong dark:shadow-none"
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                    <input
                        type="checkbox"
                        aria-label={`Select ${rule.group_id}`}
                        checked={checked}
                        onChange={() => onToggle(rule.uuid)}
                        onClick={(event) => event.stopPropagation()}
                        className={`${checkboxClasses} transition-opacity ${
                            checked
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        }`}
                    />
                    <span
                        className={`truncate font-plex-mono text-[11.5px] font-semibold ${
                            selected ? "text-muted dark:text-wb-body" : "text-muted"
                        }`}
                    >
                        {rule.group_id}
                    </span>
                </span>
                <RuleStatusPill rule={rule} />
            </div>
            <button
                type="button"
                tabIndex={-1}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect(rule);
                }}
                className={`mt-[5px] block w-full text-left text-[12.5px] leading-[1.4] ${
                    selected
                        ? "font-medium text-foreground"
                        : "text-wb-body"
                }`}
            >
                {rule.rule_title}
            </button>
        </li>
    );
});

const StigGroup = ({
    stig,
    rules,
    selectedUuid,
    selection,
    onSelectRule,
    onToggleSelection,
    onSelectAll,
    onRemoveStig,
    showHeader,
}: {
    stig: Stig;
    rules: Rule[];
    selectedUuid: string | null;
    selection: Set<string>;
    onSelectRule: (rule: Rule) => void;
    onToggleSelection: (uuid: string) => void;
    onSelectAll: (uuids: string[], selected: boolean) => void;
    onRemoveStig: (stig: Stig) => void;
    showHeader: boolean;
}) => {
    const [open, setOpen] = useState(true);
    const progress = useMemo(
        () => computeStatusCounts(stig.rules),
        [stig.rules]
    );
    const uuids = useMemo(() => rules.map((rule) => rule.uuid), [rules]);
    const allSelected =
        uuids.length > 0 && uuids.every((uuid) => selection.has(uuid));

    return (
        <section aria-label={stig.display_name} className="flex flex-col gap-2">
            {showHeader && (
                <header className="sticky top-0 z-[1] -mx-1 flex items-center gap-2 bg-canvas px-1 pb-1 pt-2">
                    <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpen((value) => !value)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[11px] font-bold uppercase tracking-[.07em] text-subtle transition-colors hover:text-foreground"
                    >
                        <Icon.chevronDown
                            className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                                open ? "" : "-rotate-90"
                            }`}
                        />
                        <span className="truncate" title={stig.display_name}>
                            {stig.display_name}
                        </span>
                    </button>
                    <span className="whitespace-nowrap text-[11px] text-subtle">
                        {progress.assessed}/{progress.total}
                        {rules.length !== stig.rules.length &&
                            ` · ${rules.length} shown`}
                    </span>
                    <input
                        type="checkbox"
                        aria-label={`Select all visible rules in ${stig.display_name}`}
                        checked={allSelected}
                        disabled={uuids.length === 0}
                        onChange={() => onSelectAll(uuids, !allSelected)}
                        className={checkboxClasses}
                    />
                    <button
                        type="button"
                        aria-label={`Remove ${stig.display_name} from checklist`}
                        title="Remove STIG from checklist"
                        onClick={() => onRemoveStig(stig)}
                        className="rounded-md p-1 text-subtle transition-colors hover:bg-danger-surface hover:text-danger-foreground"
                    >
                        <Icon.trash className="h-3.5 w-3.5" />
                    </button>
                </header>
            )}
            {open && rules.length === 0 && (
                <p className="px-1 py-2 text-xs text-subtle">
                    No rules match the current filters.
                </p>
            )}
            {open && rules.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {rules.map((rule) => (
                        <RuleCard
                            key={rule.uuid}
                            rule={rule}
                            selected={rule.uuid === selectedUuid}
                            checked={selection.has(rule.uuid)}
                            onSelect={onSelectRule}
                            onToggle={onToggleSelection}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
};

/** Middle column: checklist title, search, filter pills and rule cards. */
export const RuleList = ({
    title,
    onTitleChange,
    query,
    onQueryChange,
    searchRef,
    statuses,
    severities,
    onToggleStatus,
    onToggleSeverity,
    onClearFilters,
    counts,
    stigs,
    visibleByStig,
    selectedUuid,
    selection,
    onSelectRule,
    onToggleSelection,
    onSelectAll,
    onRemoveStig,
}: Props) => {
    const [showAllFilters, setShowAllFilters] = useState(false);
    const nothingActive = statuses.size === 0 && severities.size === 0;
    const extraActive =
        EXTRA_STATUSES.some((status) => statuses.has(status)) ||
        EXTRA_SEVERITIES.some((severity) => severities.has(severity));
    const expanded = showAllFilters || extraActive;
    const shown = [...visibleByStig.values()].reduce(
        (sum, rules) => sum + rules.length,
        0
    );

    const statusPill = (status: Status) => (
        <FilterPill
            key={status}
            active={statuses.has(status)}
            count={counts.status[status] ?? 0}
            onClick={() => onToggleStatus(status)}
        >
            {STATUS_LABEL[status]}
        </FilterPill>
    );
    const severityPill = (severity: Severity) => (
        <FilterPill
            key={severity}
            active={severities.has(severity)}
            count={counts.severity[severity] ?? 0}
            onClick={() => onToggleSeverity(severity)}
        >
            {SEVERITY_LABEL[severity].cat}
        </FilterPill>
    );

    return (
        <div className="flex w-full shrink-0 flex-col border-b border-wb-divider bg-canvas lg:h-full lg:w-[368px] lg:min-h-0 lg:border-b-0 lg:border-r">
            <div className="flex flex-col gap-2.5 px-4 pb-3 pt-[18px]">
                <div className="flex items-center justify-between gap-2">
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => onTitleChange(event.target.value)}
                        aria-label="Checklist title"
                        placeholder="Untitled checklist"
                        className="-mx-1 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 text-[15px] font-bold tracking-[-0.01em] text-foreground transition-colors hover:border-border focus:border-accent focus:ring-2 focus:ring-ring/40 focus-visible:outline-none"
                    />
                    <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setShowAllFilters((value) => !value)}
                        className="shrink-0 text-[11.5px] font-semibold text-wb-nav-active-foreground hover:underline"
                    >
                        Filters
                    </button>
                </div>
                <label className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-[9px] text-subtle shadow-wb-card transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-ring/40 dark:shadow-none">
                    <Icon.search className="h-4 w-4 shrink-0" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder={`Search ${counts.total} rules…`}
                        aria-label="Search rules"
                        className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-subtle focus:outline-none"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange("")}
                            aria-label="Clear search"
                            className="text-subtle hover:text-foreground"
                        >
                            ×
                        </button>
                    )}
                </label>
                <div className="flex flex-wrap gap-1.5">
                    <FilterPill active={nothingActive} onClick={onClearFilters}>
                        All
                    </FilterPill>
                    {PRIMARY_STATUSES.map(statusPill)}
                    {PRIMARY_SEVERITIES.map(severityPill)}
                    {expanded && EXTRA_STATUSES.map(statusPill)}
                    {expanded && EXTRA_SEVERITIES.map(severityPill)}
                </div>
                {(query || !nothingActive) && (
                    <p className="text-[11px] text-subtle" role="status">
                        {shown} of {counts.total} rules shown
                    </p>
                )}
            </div>
            <div className="wb-scroll flex flex-col gap-3 px-3 pb-3 pt-0.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                {stigs.map((stig) => (
                    <StigGroup
                        key={stig.uuid}
                        stig={stig}
                        rules={visibleByStig.get(stig.uuid) ?? []}
                        selectedUuid={selectedUuid}
                        selection={selection}
                        onSelectRule={onSelectRule}
                        onToggleSelection={onToggleSelection}
                        onSelectAll={onSelectAll}
                        onRemoveStig={onRemoveStig}
                        showHeader
                    />
                ))}
            </div>
        </div>
    );
};
