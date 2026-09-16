"use client";
import {
    Checklist,
    Convert,
    Rule,
    Severity,
    Status,
    Stig,
} from "@/api/generated/Checklist";
import { AddStig } from "@/app/components/client/editor/add_stig";
import {
    computeStatusCounts,
    ProgressSummary,
} from "@/app/components/client/editor/progress";
import {
    RuleDetail,
    RuleDetailHandlers,
} from "@/app/components/client/editor/rule_detail";
import {
    filterRules,
    StigRuleGroup,
} from "@/app/components/client/editor/rule_list";
import { useChecklistEditor } from "@/app/components/client/editor/use_checklist_editor";
import { Sidebar } from "@/app/components/sidebar";
import { Button, buttonClasses } from "@/app/components/ui/button";
import { useConfirm } from "@/app/components/ui/confirm_dialog";
import { EmptyState } from "@/app/components/ui/empty_state";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { useToast } from "@/app/components/ui/toast";
import { isEditingTarget } from "@/app/hooks/use_keyboard_nav";
import { download } from "@/app/utils";
import { useRouter } from "next/navigation";
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { ChecklistTargetData } from "./checklist_target_data";
import { SeverityBadge, bySeverity } from "./severity";
import { StatusBadge, byStatus } from "./status";

const toCKLB = (checklist: Checklist) => {
    const blob = new Blob([Convert.checklistToJson(checklist)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    download(url, `checklist-${checklist.id}.cklb`);
    URL.revokeObjectURL(url);
};

const STATUS_KEYS: Status[] = [
    Status.Open,
    Status.NotReviewed,
    Status.NotAFinding,
    Status.NotApplicable,
];

const SaveIndicator = ({ state }: { state: string }) => {
    if (state === "idle") {
        return null;
    }
    const text = {
        saving: "Saving…",
        saved: "Saved ✓",
        error: "Save failed",
    }[state];
    return (
        <span
            role="status"
            className={`text-xs whitespace-nowrap ${
                state === "error" ? "text-danger-foreground" : "text-subtle"
            }`}
        >
            {text}
        </span>
    );
};

export const ChecklistView = ({ checklistId }: { checklistId: string }) => {
    const editor = useChecklistEditor(checklistId);
    const { checklist, rules, saveState, flush } = editor;
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const [addStigOpen, setAddStigOpen] = useState(false);
    const [severities, setSeverities] = useState<Set<Severity>>(new Set());
    const [statuses, setStatuses] = useState<Set<Status>>(new Set());
    const router = useRouter();
    const confirm = useConfirm();
    const { toast } = useToast();

    const ruleByUuid = useMemo(() => {
        const map = new Map<string, Rule>();
        rules.forEach((rule) => map.set(rule.uuid, rule));
        return map;
    }, [rules]);

    const progress = useMemo(() => computeStatusCounts(rules), [rules]);

    const counts = useMemo(() => {
        const counts: {
            severity: Record<Severity, number>;
            status: Record<Status, number>;
        } = {
            severity: {} as Record<Severity, number>,
            status: {} as Record<Status, number>,
        };
        rules.forEach((rule) => {
            const severity =
                rule.overrides?.severity?.severity ?? rule.severity;
            counts.severity[severity] = (counts.severity[severity] ?? 0) + 1;
            counts.status[rule.status] =
                (counts.status[rule.status] ?? 0) + 1;
        });
        return {
            severity: Object.entries(counts.severity).sort(([a], [b]) =>
                bySeverity(b as Severity, a as Severity)
            ),
            status: Object.entries(counts.status).sort(([a], [b]) =>
                byStatus(b as Status, a as Status)
            ),
        };
    }, [rules]);

    // Navigation order: document order of the filtered rules.
    const visibleUuids = useMemo(
        () =>
            (checklist?.stigs ?? []).flatMap((stig) =>
                filterRules(stig.rules, severities, statuses).map(
                    (rule) => rule.uuid
                )
            ),
        [checklist, severities, statuses]
    );

    const selectedRule = selectedUuid
        ? (ruleByUuid.get(selectedUuid) ?? null)
        : null;
    const selectedPosition = selectedUuid
        ? visibleUuids.indexOf(selectedUuid)
        : -1;

    const moveSelection = useCallback(
        (delta: -1 | 1) => {
            if (!visibleUuids.length) {
                return;
            }
            flush();
            setSelectedUuid((previous) => {
                if (!previous) {
                    return visibleUuids[0];
                }
                const index = visibleUuids.indexOf(previous);
                if (index === -1) {
                    return visibleUuids[0];
                }
                const next = Math.min(
                    Math.max(index + delta, 0),
                    visibleUuids.length - 1
                );
                return visibleUuids[next];
            });
        },
        [visibleUuids, flush]
    );

    const onSelectRule = useCallback(
        (rule: Rule) => {
            flush();
            setAddStigOpen(false);
            setSelectedUuid(rule.uuid);
        },
        [flush]
    );

    const onToggleSelection = useCallback((uuid: string) => {
        setSelection((previous) => {
            const next = new Set(previous);
            if (next.has(uuid)) {
                next.delete(uuid);
            } else {
                next.add(uuid);
            }
            return next;
        });
    }, []);

    const onSelectAll = useCallback((uuids: string[], selected: boolean) => {
        setSelection((previous) => {
            const next = new Set(previous);
            uuids.forEach((uuid) =>
                selected ? next.add(uuid) : next.delete(uuid)
            );
            return next;
        });
    }, []);

    // Keyboard shortcuts: j/k navigate, 1–4 set status, x select, Esc close.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedUuid(null);
                setSelection(new Set());
                return;
            }
            if (isEditingTarget(event)) {
                return;
            }
            switch (event.key) {
                case "j":
                case "ArrowDown":
                    event.preventDefault();
                    moveSelection(1);
                    break;
                case "k":
                case "ArrowUp":
                    event.preventDefault();
                    moveSelection(-1);
                    break;
                case "1":
                case "2":
                case "3":
                case "4":
                    if (selectedUuid) {
                        editor.setStatus(
                            [selectedUuid],
                            STATUS_KEYS[parseInt(event.key) - 1]
                        );
                    }
                    break;
                case "x":
                    if (selectedUuid) {
                        onToggleSelection(selectedUuid);
                    }
                    break;
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [moveSelection, selectedUuid, editor, onToggleSelection]);

    const removeRule = useCallback(
        async (rule: Rule) => {
            const confirmed = await confirm({
                title: "Remove rule?",
                description: `"${rule.rule_title}" will be removed from this checklist. This cannot be undone.`,
                tone: "danger",
                confirmLabel: "Remove",
            });
            if (confirmed) {
                await editor.removeRule(rule.uuid);
                setSelectedUuid(null);
                setSelection((previous) => {
                    const next = new Set(previous);
                    next.delete(rule.uuid);
                    return next;
                });
            }
        },
        [confirm, editor]
    );

    const removeStig = useCallback(
        async (stig: Stig) => {
            const confirmed = await confirm({
                title: "Remove STIG?",
                description: `"${stig.display_name}" and all ${stig.size} of its rules will be removed from this checklist. This cannot be undone.`,
                tone: "danger",
                confirmLabel: "Remove",
            });
            if (confirmed) {
                await editor.removeStig(stig);
                setSelectedUuid(null);
                setSelection(new Set());
            }
        },
        [confirm, editor]
    );

    const deleteChecklist = useCallback(async () => {
        const confirmed = await confirm({
            title: "Delete checklist?",
            description: `"${checklist?.title}" will be deleted from this browser. This cannot be undone.`,
            tone: "danger",
            confirmLabel: "Delete",
        });
        if (confirmed) {
            await editor.deleteChecklist();
            router.push("/editor");
        }
    }, [confirm, checklist?.title, editor, router]);

    const handleAddStig = useCallback(
        async (stig: Stig) => {
            await editor.addStig(stig);
            setAddStigOpen(false);
            toast({
                tone: "success",
                title: "STIG added",
                description: `"${stig.display_name}" was added to the checklist.`,
            });
        },
        [editor, toast]
    );

    const bulkSetStatus = useCallback(
        (status: Status) => {
            const uuids = [...selection];
            editor.setStatus(uuids, status);
            setSelection(new Set());
            toast({
                tone: "success",
                title: `Updated ${uuids.length} rule${
                    uuids.length === 1 ? "" : "s"
                }`,
                description: `Status set to "${status.replaceAll("_", " ")}".`,
            });
        },
        [selection, editor, toast]
    );

    const detailHandlers: RuleDetailHandlers = useMemo(
        () => ({
            updateRuleText: editor.updateRuleText,
            setStatus: editor.setStatus,
            setSeverity: editor.setSeverity,
            setOverrideReason: editor.setOverrideReason,
            onRemove: removeRule,
        }),
        [editor, removeRule]
    );

    const existingStigNames = useMemo(
        () => new Set(checklist?.stigs.map((stig) => stig.stig_name) ?? []),
        [checklist]
    );

    const toggleFilter = <T,>(
        set: Set<T>,
        setter: (next: Set<T>) => void,
        value: T
    ) => {
        const next = new Set(set);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        setter(next);
    };

    if (!checklist) {
        return <SkeletonTable rows={8} className="my-4" />;
    }

    const detail = selectedRule ? (
        <RuleDetail
            rule={selectedRule}
            handlers={detailHandlers}
            onPrevious={
                selectedPosition > 0 ? () => moveSelection(-1) : undefined
            }
            onNext={
                selectedPosition > -1 &&
                selectedPosition < visibleUuids.length - 1
                    ? () => moveSelection(1)
                    : undefined
            }
            position={
                selectedPosition > -1
                    ? {
                          index: selectedPosition,
                          total: visibleUuids.length,
                      }
                    : undefined
            }
        />
    ) : null;

    return (
        <Suspense fallback={<SkeletonTable rows={8} className="my-4" />}>
            <Breadcrumbs editor />

            {/* Mobile rule editor drawer; desktop uses the right pane. */}
            <div className="lg:hidden">
                <Sidebar
                    isOpen={selectedRule !== null}
                    onClick={() => setSelectedUuid(null)}
                    headerText={selectedRule?.rule_title ?? "Rule Details"}
                >
                    {detail}
                </Sidebar>
            </div>

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

            <section className="my-4 w-full flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        key={checklist.id}
                        type="text"
                        value={checklist.title}
                        onChange={(event) =>
                            editor.updateTitle(event.target.value)
                        }
                        aria-label="Checklist title"
                        placeholder="Untitled checklist"
                        className="flex-1 min-w-[16rem] text-3xl max-sm:text-2xl font-semibold tracking-tight text-foreground bg-transparent rounded-md border border-transparent px-1 -mx-1 hover:border-border focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-ring/40 transition-colors"
                    />
                    <div className="flex items-center gap-2">
                        <SaveIndicator state={saveState} />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setSelectedUuid(null);
                                setAddStigOpen(true);
                            }}
                        >
                            Add STIG
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                flush();
                                toCKLB(checklist);
                                toast({
                                    tone: "success",
                                    title: "Checklist exported",
                                    description:
                                        "The .cklb file is compatible with DISA STIG Viewer 3.",
                                });
                            }}
                        >
                            Export CKLB
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={deleteChecklist}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <ProgressSummary progress={progress} />

                <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div className="flex flex-wrap items-center">
                        {counts.status.map(([status, count]) => (
                            <StatusBadge
                                key={status}
                                status={status as Status}
                                count={count}
                                selected={statuses.has(status as Status)}
                                onClick={() =>
                                    toggleFilter(
                                        statuses,
                                        setStatuses,
                                        status as Status
                                    )
                                }
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center">
                        {counts.severity.map(([severity, count]) => (
                            <SeverityBadge
                                key={severity}
                                severity={severity as Severity}
                                count={count}
                                selected={severities.has(severity as Severity)}
                                onClick={() =>
                                    toggleFilter(
                                        severities,
                                        setSeverities,
                                        severity as Severity
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>

                <ChecklistTargetData
                    checklist={checklist}
                    onChange={editor.updateTargetData}
                />
            </section>

            {checklist.stigs.length === 0 ? (
                <EmptyState
                    className="w-full"
                    title="This checklist has no STIGs yet"
                    description="Add a STIG to start assessing rules."
                    action={
                        <button
                            type="button"
                            onClick={() => setAddStigOpen(true)}
                            className={buttonClasses({
                                variant: "primary",
                                size: "sm",
                            })}
                        >
                            Add STIG
                        </button>
                    }
                />
            ) : (
                <div className="w-full grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
                    <div className="flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
                        {checklist.stigs.map((stig) => (
                            <StigRuleGroup
                                key={stig.uuid}
                                stig={stig}
                                severities={severities}
                                statuses={statuses}
                                selectedUuid={selectedUuid}
                                selection={selection}
                                onSelectRule={onSelectRule}
                                onToggleSelection={onToggleSelection}
                                onSelectAll={onSelectAll}
                                onRemoveStig={removeStig}
                            />
                        ))}
                    </div>
                    <div className="max-lg:hidden lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto rounded-lg border border-border bg-surface shadow-card p-5">
                        {detail ?? (
                            <EmptyState
                                className="border-0"
                                title="Select a rule to begin"
                                description="Click a rule on the left, or use j/k to move and 1–4 to set its status."
                            />
                        )}
                    </div>
                </div>
            )}

            {selection.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-lg border border-border bg-surface shadow-overlay px-4 py-2.5 flex-wrap max-sm:w-[calc(100%-2rem)]">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                        {selection.size} selected
                    </span>
                    <span className="text-xs text-subtle max-sm:hidden">
                        Set status:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                        {STATUS_KEYS.map((status) => (
                            <StatusBadge
                                key={status}
                                status={status}
                                onClick={() => bulkSetStatus(status)}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelection(new Set())}
                        className="text-xs font-medium text-accent hover:underline"
                    >
                        Clear
                    </button>
                </div>
            )}
        </Suspense>
    );
};
