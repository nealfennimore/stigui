"use client";
import {
    Checklist,
    Convert,
    Rule,
    Severity,
    Status,
    Stig,
    TargetData,
} from "@/api/generated/Checklist";
import { AddStig } from "@/app/components/client/editor/add_stig";
import { RuleEdit } from "@/app/components/client/editor/rule";
import { Sidebar } from "@/app/components/sidebar";
import { buttonClasses } from "@/app/components/ui/button";
import { IDB, IDBChecklist } from "@/app/db";
import { debounce, download } from "@/app/utils";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { ChecklistTargetData } from "./checklist_target_data";
import { SeverityBadge, bySeverity } from "./severity";
import { StatusBadge, byStatus } from "./status";
import { Order, Table, defaultFilter, defaultSort } from "./table";

const sorters = [defaultSort, bySeverity, byStatus, null, null];
const filters = [null, null, defaultFilter, null, null];

const compare = (a: { [key: string]: any }, b: { [key: string]: any }) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (const key of aKeys) {
        const aValue = a?.[key] as object | string | number | boolean;
        const bValue = b?.[key] as object | string | number | boolean;

        if (typeof aValue === "object" && typeof bValue === "object") {
            if (!compare(aValue, bValue)) {
                return false;
            }
        } else {
            if (aValue !== bValue) {
                return false;
            }
        }
    }
    return true;
};

type FormRuleProperties = Pick<
    Rule,
    "overrides" | "status" | "comments" | "finding_details"
>;

interface FormChecklistChanges {
    rule: Record<string, FormRuleProperties>;
    target_data: Record<string, TargetData>;
    checklist: { title?: string };
}

const toCKLB = (checklist: Checklist) => {
    const blob = new Blob([Convert.checklistToJson(checklist)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    download(url, `checklist-${checklist.id}.cklb`);
    URL.revokeObjectURL(url);
};

const tableHeaders = [
    { text: "Status" },
    { text: "Severity" },
    { text: "Title" },
    { text: "Description", className: "max-lg:hidden" },
    { text: "", className: "max-md:hidden" },
];

const StigTable = ({
    stig,
    severities,
    statuses,
    onSelectRule,
    removeRule,
}: {
    stig: Stig;
    severities: Set<Severity>;
    statuses: Set<Status>;
    onSelectRule: (rule: Rule) => void;
    removeRule: (rule: Rule) => void;
}) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isOpen, setOpen] = useState(true);

    const viewableRules = useMemo(() => {
        return stig.rules.filter((rule) => {
            const severity =
                rule.overrides?.severity?.severity ?? rule.severity;
            const status = rule.status;

            if (severities.size > 0 && !severities.has(severity)) {
                return false;
            }
            if (statuses.size > 0 && !statuses.has(status)) {
                return false;
            }
            return true;
        });
    }, [stig.rules, severities, statuses]);

    const tableBody = useMemo(() => {
        return viewableRules.map((rule) => ({
            onClick: () => onSelectRule(rule),
            values: [
                rule.status,
                rule.overrides?.severity?.severity ?? rule.severity,
                rule.rule_title,
                rule.discussion,
                "",
            ],
            columns: [
                <StatusBadge status={rule.status} />,
                <SeverityBadge
                    severity={
                        rule.overrides?.severity?.severity ?? rule.severity
                    }
                />,
                rule.rule_title,
                rule.discussion,
                <button
                    type="button"
                    aria-label="Remove from checklist"
                    title="Remove from checklist"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeRule(rule);
                    }}
                    className="text-subtle hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                    🗑️
                </button>,
            ],
            classNames: [
                null,
                null,
                null,
                "max-lg:hidden",
                "text-right w-px max-md:hidden",
            ],
        }));
    }, [viewableRules, onSelectRule, removeRule]);

    return (
        <div className="w-full mb-2 rounded-lg border border-border overflow-hidden">
            <h2>
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-5 bg-surface-muted hover:bg-surface transition-colors gap-3"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(!isOpen)}
                >
                    <span className="flex flex-col items-start gap-0.5 text-left">
                        <span className="text-foreground text-sm font-medium">
                            {stig.display_name}
                        </span>
                        <span className="text-muted text-xs">
                            {viewableRules.length === stig.size
                                ? `${stig.size} rules`
                                : `${viewableRules.length} of ${stig.size} rules`}
                            {" · "}
                            Version {stig.version}
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
            </h2>
            <div className={isOpen ? "" : "hidden"}>
                <div className="border-t border-border bg-surface">
                    {stig.release_info && (
                        <div className="px-5 py-3 border-b border-border bg-surface-muted text-muted text-xs">
                            {stig.release_info.replace(
                                /\s*Benchmark Date:/,
                                " · Benchmark Date:",
                            )}
                        </div>
                    )}
                    <section className="w-full flex flex-col">
                        <div className="relative overflow-x-auto">
                            <form
                                ref={formRef}
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <Table
                                    formRef={formRef}
                                    filters={filters}
                                    sorters={sorters}
                                    tableHeaders={tableHeaders}
                                    tableBody={tableBody}
                                    initialOrders={[
                                        Order.NONE,
                                        Order.DESC,
                                        Order.NONE,
                                        Order.NONE,
                                        Order.NONE,
                                    ]}
                                />
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export const ChecklistView = ({ checklistId }: { checklistId: string }) => {
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [addStigOpen, setAddStigOpen] = useState(false);
    const [severities, setSeverities] = useState<Set<Severity>>(new Set());
    const [statuses, setStatuses] = useState<Set<Status>>(new Set());

    useEffect(() => {
        (async () => {
            const checklist = await IDB.exportChecklist(checklistId);
            setChecklist(checklist);
        })();
    }, [checklistId]);

    const currentRules = useMemo(() => {
        if (!checklist) {
            return {};
        }
        return checklist.stigs
            .flatMap((stig) => stig.rules)
            .reduce(
                (acc, rule) => {
                    acc[rule.uuid] = rule;
                    return acc;
                },
                {} as Record<string, Rule>,
            );
    }, [checklist]);

    const counts = useMemo(() => {
        const counts: {
            severity: Record<Severity, number>;
            status: Record<Status, number>;
        } = {
            severity: {} as Record<Severity, number>,
            status: {} as Record<Status, number>,
        };
        Object.values(currentRules).forEach((rule) => {
            const severity =
                rule.overrides?.severity?.severity ?? rule.severity;
            const status = rule.status;

            if (!counts.severity[severity]) {
                counts.severity[severity] = 0;
            }
            counts.severity[severity]++;

            if (!counts.status[status]) {
                counts.status[status] = 0;
            }
            counts.status[status]++;
        });

        return {
            severity: Object.entries(counts.severity).sort(([a], [b]) =>
                bySeverity(b as Severity, a as Severity),
            ),
            status: Object.entries(counts.status).sort(([a], [b]) =>
                byStatus(b as Status, a as Status),
            ),
        };
    }, [currentRules]);

    const rule = useMemo(
        () => (selectedUuid ? (currentRules[selectedUuid] ?? null) : null),
        [selectedUuid, currentRules],
    );

    const onSelectRule = useMemo(
        () => (rule: Rule) => {
            setAddStigOpen(false);
            setSelectedUuid(rule.uuid);
        },
        [],
    );

    const handleChange = useMemo(
        () => (e: Event) => {
            if (!formRef.current) {
                return;
            }
            const formData = new FormData(formRef.current);
            let data = {
                rule: {},
                target_data: {},
                checklist: {},
            } as FormChecklistChanges;
            let updates = [];

            for (const [key, value] of formData.entries()) {
                const [type, uuid, ...paths] = key.split(".");
                if (
                    type !== "target_data" &&
                    type !== "rule" &&
                    type !== "checklist"
                ) {
                    continue;
                }

                let length = paths.length;
                let currentRule = currentRules[uuid];

                if (type === "rule") {
                    // @ts-ignore
                    if (
                        length === 1 &&
                        // @ts-ignore
                        currentRule?.[paths[0]] === value
                    ) {
                        continue;
                    }

                    if (!data.rule[uuid]) {
                        data.rule[uuid] = {} as FormRuleProperties;
                    }
                    let nextRuleData = data.rule[uuid];
                    for (const [idx, path] of paths.entries()) {
                        // @ts-ignore
                        if (nextRuleData[path] === undefined && length > 1) {
                            // @ts-ignore
                            nextRuleData[path] = {};
                        }
                        if (idx === length - 1) {
                            // @ts-ignore
                            nextRuleData[path] = value;
                        } else {
                            // @ts-ignore
                            nextRuleData = nextRuleData[path];
                        }
                    }
                } else if (type === "target_data") {
                    if (!data.target_data[uuid]) {
                        data.target_data[uuid] = {
                            is_web_database: false,
                        } as TargetData;
                    }
                    const path = paths[0];
                    if (path === "is_web_database") {
                        data.target_data[uuid][path] =
                            value === "true" || value === "on";
                    } else {
                        data.target_data[uuid][path] = value;
                    }
                } else if (type === "checklist") {
                    if (paths[0] === "title") {
                        data.checklist.title = value as string;
                    }
                }
            }
            for (const [uuid, value] of Object.entries(data.rule)) {
                // Skip if only overrides are changed
                // and the overrides are the same as the current overrides
                if (
                    Object.keys(value).length === 1 &&
                    value.overrides &&
                    compare(value.overrides, currentRules[uuid].overrides)
                ) {
                    continue;
                }
                let rule = {
                    ...currentRules[uuid],
                    ...value,
                    uuid,
                } as Rule;
                updates.push(IDB.rules.put(rule));
            }

            const targetDataChange = data.target_data[checklistId];
            const targetChanged =
                !!targetDataChange &&
                !compare(targetDataChange, checklist?.target_data as TargetData);
            const titleChanged =
                data.checklist.title !== undefined &&
                data.checklist.title !== checklist?.title;

            if (titleChanged || targetChanged) {
                const nextChecklist = {
                    ...checklist,
                    ...(titleChanged ? { title: data.checklist.title } : {}),
                    target_data: {
                        ...checklist?.target_data,
                        ...(targetChanged ? targetDataChange : {}),
                    },
                } as IDBChecklist;
                updates.push(IDB.checklists.put(nextChecklist));
            }

            Promise.all(updates).then(async () => {
                const checklist = await IDB.exportChecklist(checklistId);
                setChecklist(checklist);
            });
        },
        [currentRules, checklist, checklistId],
    );

    const debouncedHandleChange = useMemo(
        () => debounce(handleChange, 500),
        [handleChange],
    );

    const handleRemoveRule = useMemo(
        () => async (uuid: string) => {
            await IDB.rules.del(uuid);
            const checklist = await IDB.exportChecklist(checklistId);
            setChecklist(checklist);
            setSelectedUuid(null);
        },
        [checklistId],
    );

    const removeRule = useMemo(
        () => (rule: Rule) => {
            if (
                window.confirm(
                    `Remove "${rule.rule_title}" from this checklist? This cannot be undone.`,
                )
            ) {
                handleRemoveRule(rule.uuid);
            }
        },
        [handleRemoveRule],
    );

    const handleAddStig = useMemo(
        () => async (stig: Stig) => {
            await IDB.addStig(checklistId, stig);
            const checklist = await IDB.exportChecklist(checklistId);
            setChecklist(checklist);
            setAddStigOpen(false);
        },
        [checklistId],
    );

    const existingStigNames = useMemo(
        () => new Set(checklist?.stigs.map((stig) => stig.stig_name) ?? []),
        [checklist],
    );

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Breadcrumbs editor />
            <form
                ref={formRef}
                onSubmit={(e) => e.preventDefault()}
                onChange={debouncedHandleChange}
                className="w-full"
            >
                <Sidebar
                    isOpen={rule !== null}
                    onClick={() => setSelectedUuid(null)}
                    headerText={rule?.rule_title ?? "Rule Details"}
                >
                    <RuleEdit rule={rule} onRemove={removeRule} />
                </Sidebar>

                {checklist && (
                    <section className="my-4 w-full flex flex-col">
                        <input
                            key={checklist.id}
                            type="text"
                            name={`checklist.${checklist.id}.title`}
                            defaultValue={checklist.title}
                            aria-label="Checklist title"
                            placeholder="Untitled checklist"
                            className="text-3xl font-semibold tracking-tight mb-6 text-foreground bg-transparent w-full rounded-md border border-transparent px-1 -mx-1 hover:border-border focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-ring/40 transition-colors"
                        />
                        <ChecklistTargetData checklist={checklist} />
                        <div className="text-xs flex justify-end gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedUuid(null);
                                    setAddStigOpen(true);
                                }}
                                className={buttonClasses({
                                    variant: "secondary",
                                    size: "sm",
                                })}
                            >
                                Add STIG ➕
                            </button>
                            <button
                                type="button"
                                onClick={() => toCKLB(checklist)}
                                className={buttonClasses({
                                    variant: "secondary",
                                    size: "sm",
                                })}
                            >
                                CKLB ⬇️
                            </button>
                        </div>
                    </section>
                )}
            </form>

            <Sidebar
                isOpen={addStigOpen}
                onClick={() => setAddStigOpen(false)}
                headerText="Add STIG"
            >
                <AddStig
                    isOpen={addStigOpen}
                    existingStigNames={existingStigNames}
                    onAdd={handleAddStig}
                />
            </Sidebar>

            {checklist && (
                <aside className="w-full flex justify-between items-center my-6 flex-wrap gap-2">
                    <div>
                        {counts.severity.map(([severity, count]) => (
                            <SeverityBadge
                                key={severity}
                                severity={severity as Severity}
                                count={count}
                                Element="button"
                                selected={severities.has(severity as Severity)}
                                onClick={() => {
                                    const newSeverities = new Set(severities);
                                    if (
                                        newSeverities.has(severity as Severity)
                                    ) {
                                        newSeverities.delete(
                                            severity as Severity,
                                        );
                                    } else {
                                        newSeverities.add(severity as Severity);
                                    }
                                    setSeverities(newSeverities);
                                }}
                            />
                        ))}
                    </div>
                    <div>
                        {counts.status.map(([status, count]) => (
                            <StatusBadge
                                key={status}
                                status={status as Status}
                                count={count}
                                Element="button"
                                selected={statuses.has(status as Status)}
                                onClick={() => {
                                    const newStatuses = new Set(statuses);
                                    if (newStatuses.has(status as Status)) {
                                        newStatuses.delete(status as Status);
                                    } else {
                                        newStatuses.add(status as Status);
                                    }
                                    setStatuses(newStatuses);
                                }}
                            />
                        ))}
                    </div>
                </aside>
            )}

            {checklist?.stigs.map((stig) => (
                <StigTable
                    key={stig.uuid}
                    stig={stig}
                    severities={severities}
                    statuses={statuses}
                    onSelectRule={onSelectRule}
                    removeRule={removeRule}
                />
            ))}
        </Suspense>
    );
};
