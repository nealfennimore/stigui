"use client";
import { Rule, Severity, Status, Stig } from "@/api/generated/Checklist";
import {
    computeStatusCounts,
    ProgressBar,
} from "@/app/components/client/editor/progress";
import { bySeverity, SeverityBadge } from "@/app/components/severity";
import { byStatus, StatusBadge } from "@/app/components/status";
import {
    defaultFilter,
    defaultSort,
    Order,
    Table,
} from "@/app/components/table";
import { useCallback, useMemo, useState } from "react";

const sorters = [null, byStatus, bySeverity, defaultSort];
const filters = [null, null, null, defaultFilter];
const tableHeaders = [
    { text: "", className: "w-px !px-3" },
    { text: "Status" },
    { text: "Severity", className: "max-md:hidden" },
    { text: "Title" },
];

export const filterRules = (
    rules: Rule[],
    severities: Set<Severity>,
    statuses: Set<Status>
) =>
    rules.filter((rule) => {
        const severity = rule.overrides?.severity?.severity ?? rule.severity;
        if (severities.size > 0 && !severities.has(severity)) {
            return false;
        }
        if (statuses.size > 0 && !statuses.has(rule.status)) {
            return false;
        }
        return true;
    });

export const StigRuleGroup = ({
    stig,
    severities,
    statuses,
    selectedUuid,
    selection,
    onSelectRule,
    onToggleSelection,
    onSelectAll,
    onRemoveStig,
}: {
    stig: Stig;
    severities: Set<Severity>;
    statuses: Set<Status>;
    selectedUuid: string | null;
    selection: Set<string>;
    onSelectRule: (rule: Rule) => void;
    onToggleSelection: (uuid: string) => void;
    onSelectAll: (uuids: string[], selected: boolean) => void;
    onRemoveStig: (stig: Stig) => void;
}) => {
    const [isOpen, setOpen] = useState(true);

    const viewableRules = useMemo(
        () => filterRules(stig.rules, severities, statuses),
        [stig.rules, severities, statuses]
    );

    const progress = useMemo(
        () => computeStatusCounts(stig.rules),
        [stig.rules]
    );

    const visibleUuids = useMemo(
        () => viewableRules.map((rule) => rule.uuid),
        [viewableRules]
    );
    const allVisibleSelected =
        visibleUuids.length > 0 &&
        visibleUuids.every((uuid) => selection.has(uuid));

    const tableBody = useMemo(
        () =>
            viewableRules.map((rule) => ({
                onClick: () => onSelectRule(rule),
                values: [
                    rule.uuid,
                    rule.status,
                    rule.overrides?.severity?.severity ?? rule.severity,
                    rule.rule_title,
                ],
                columns: [
                    <input
                        type="checkbox"
                        aria-label={`Select ${rule.rule_title}`}
                        checked={selection.has(rule.uuid)}
                        onChange={() => onToggleSelection(rule.uuid)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-border-strong text-accent focus:ring-ring/40"
                    />,
                    <StatusBadge status={rule.status} />,
                    <SeverityBadge
                        severity={
                            rule.overrides?.severity?.severity ?? rule.severity
                        }
                    />,
                    <span className="line-clamp-2">{rule.rule_title}</span>,
                ],
                classNames: [
                    "w-px !px-3",
                    "whitespace-nowrap",
                    "max-md:hidden",
                    null,
                ],
            })),
        [viewableRules, selection, onSelectRule, onToggleSelection]
    );

    const rowKey = useCallback(
        (row: { values: string[] }) => row.values[0],
        []
    );

    return (
        <div className="w-full rounded-lg border border-border overflow-hidden">
            <h2 className="flex items-center bg-surface-muted">
                <span className="flex items-center pl-4">
                    <input
                        type="checkbox"
                        aria-label={`Select all visible rules in ${stig.display_name}`}
                        checked={allVisibleSelected}
                        onChange={() =>
                            onSelectAll(visibleUuids, !allVisibleSelected)
                        }
                        className="h-4 w-4 rounded border-border-strong text-accent focus:ring-ring/40"
                    />
                </span>
                <button
                    type="button"
                    className="flex items-center justify-between flex-1 p-4 hover:bg-surface transition-colors gap-3 min-w-0"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(!isOpen)}
                >
                    <span className="flex flex-col items-start gap-1.5 text-left min-w-0 flex-1">
                        <span className="text-foreground text-sm font-medium truncate w-full">
                            {stig.display_name}
                        </span>
                        <ProgressBar progress={progress} size="sm" />
                        <span className="text-muted text-xs">
                            {progress.assessed}/{progress.total} assessed
                            {viewableRules.length !== stig.rules.length &&
                                ` · showing ${viewableRules.length}`}
                            {" · "}v{stig.version}
                        </span>
                    </span>
                    <svg
                        className={
                            `w-4 h-4 shrink-0 text-muted transition-transform` +
                            (isOpen ? " rotate-180" : "")
                        }
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5 5 1 1 5"
                        ></path>
                    </svg>
                </button>
                <button
                    type="button"
                    aria-label="Remove STIG from checklist"
                    title="Remove STIG from checklist"
                    onClick={() => onRemoveStig(stig)}
                    className="shrink-0 self-stretch px-4 text-subtle hover:text-danger-foreground hover:bg-danger-surface/40 transition-colors"
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
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </h2>
            <div className={isOpen ? "" : "hidden"}>
                <div className="border-t border-border bg-surface">
                    <div className="relative overflow-x-auto">
                        <Table
                            filters={filters}
                            sorters={sorters}
                            tableHeaders={tableHeaders}
                            tableBody={tableBody}
                            initialOrders={[
                                Order.NONE,
                                Order.NONE,
                                Order.NONE,
                                Order.NONE,
                            ]}
                            caption={`Rules in ${stig.display_name}`}
                            rowKey={rowKey}
                            selectedKey={selectedUuid}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
