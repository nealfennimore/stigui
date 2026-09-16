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
import { computeStatusCounts } from "@/app/components/client/editor/progress";
import {
    RuleDetail,
    RuleDetailHandlers,
} from "@/app/components/client/editor/rule_detail";
import { RuleList } from "@/app/components/client/editor/rule_list";
import {
    effectiveSeverity,
    filterRules,
    STATUS_NAME,
    STATUS_ORDER,
} from "@/app/components/client/editor/rule_meta";
import { ShellAction, WorkbenchShell } from "@/app/components/client/editor/shell";
import { useChecklistEditor } from "@/app/components/client/editor/use_checklist_editor";
import {
    getLastChecklistId,
    setLastChecklistId,
} from "@/app/components/client/editor/workbench_state";
import { Sidebar } from "@/app/components/sidebar";
import { buttonClasses } from "@/app/components/ui/button";
import { useConfirm } from "@/app/components/ui/confirm_dialog";
import { EmptyState } from "@/app/components/ui/empty_state";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useToast } from "@/app/components/ui/toast";
import { isEditingTarget } from "@/app/hooks/use_keyboard_nav";
import { download } from "@/app/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChecklistTargetData } from "./checklist_target_data";

const toCKLB = (checklist: Checklist) => {
    const blob = new Blob([Convert.checklistToJson(checklist)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    download(url, `checklist-${checklist.id}.cklb`);
    URL.revokeObjectURL(url);
};

type Drawer = "add-stig" | "metadata" | null;

const toggleIn = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) {
        next.delete(value);
    } else {
        next.add(value);
    }
    return next;
};

const LoadingColumns = () => (
    <>
        <div className="flex w-full shrink-0 flex-col gap-2 border-wb-divider p-4 lg:w-[368px] lg:border-r">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-9 w-full" />
            {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
        </div>
        <div className="hidden flex-1 flex-col gap-3 p-[26px] lg:flex">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-40 w-full rounded-[14px]" />
        </div>
    </>
);

export const ChecklistView = ({ checklistId }: { checklistId: string }) => {
    const editor = useChecklistEditor(checklistId);
    const { checklist, missing, rules, saveState, flush } = editor;
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const [drawer, setDrawer] = useState<Drawer>(null);
    const [query, setQuery] = useState("");
    const [severities, setSeverities] = useState<Set<Severity>>(new Set());
    const [statuses, setStatuses] = useState<Set<Status>>(new Set());
    const searchRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const confirm = useConfirm();
    const { toast } = useToast();

    // The Workbench nav item reopens the last checklist that loaded.
    useEffect(() => {
        if (checklist) {
            setLastChecklistId(checklist.id);
        } else if (missing && getLastChecklistId() === checklistId) {
            setLastChecklistId(null);
        }
    }, [checklist, missing, checklistId]);

    const ruleByUuid = useMemo(() => {
        const map = new Map<string, Rule>();
        rules.forEach((rule) => map.set(rule.uuid, rule));
        return map;
    }, [rules]);

    const progress = useMemo(() => computeStatusCounts(rules), [rules]);

    const counts = useMemo(() => {
        const status = {} as Record<Status, number>;
        const severity = {} as Record<Severity, number>;
        rules.forEach((rule) => {
            status[rule.status] = (status[rule.status] ?? 0) + 1;
            const level = effectiveSeverity(rule);
            severity[level] = (severity[level] ?? 0) + 1;
        });
        return { status, severity, total: rules.length };
    }, [rules]);

    const visibleByStig = useMemo(() => {
        const map = new Map<string, Rule[]>();
        (checklist?.stigs ?? []).forEach((stig) =>
            map.set(
                stig.uuid,
                filterRules(stig.rules, query, statuses, severities)
            )
        );
        return map;
    }, [checklist, query, statuses, severities]);

    // Navigation order: document order of the filtered rules.
    const visibleUuids = useMemo(
        () =>
            [...visibleByStig.values()].flatMap((list) =>
                list.map((rule) => rule.uuid)
            ),
        [visibleByStig]
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
                const index = previous ? visibleUuids.indexOf(previous) : -1;
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

    /** Next Not Reviewed rule after the current one, wrapping around. */
    const jumpToUnreviewed = useCallback(() => {
        if (!visibleUuids.length) {
            return false;
        }
        flush();
        const start = selectedUuid ? visibleUuids.indexOf(selectedUuid) : -1;
        for (let step = 1; step <= visibleUuids.length; step++) {
            const uuid = visibleUuids[(start + step) % visibleUuids.length];
            if (
                uuid !== selectedUuid &&
                ruleByUuid.get(uuid)?.status === Status.NotReviewed
            ) {
                setSelectedUuid(uuid);
                return true;
            }
        }
        return false;
    }, [visibleUuids, selectedUuid, ruleByUuid, flush]);

    const saveAndNext = useCallback(() => {
        flush();
        if (!jumpToUnreviewed()) {
            if (
                selectedPosition > -1 &&
                selectedPosition < visibleUuids.length - 1
            ) {
                moveSelection(1);
            } else {
                toast({
                    tone: "success",
                    title: "Saved",
                    description: "No rules are left to review in this view.",
                });
            }
        }
    }, [
        flush,
        jumpToUnreviewed,
        selectedPosition,
        visibleUuids.length,
        moveSelection,
        toast,
    ]);

    const onSelectRule = useCallback(
        (rule: Rule) => {
            flush();
            setDrawer(null);
            setSelectedUuid(rule.uuid);
        },
        [flush]
    );

    const onToggleSelection = useCallback((uuid: string) => {
        setSelection((previous) => toggleIn(previous, uuid));
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

    // Shortcuts: j/k move, 1–4 status, x select, / search, Esc close.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (document.activeElement === searchRef.current) {
                    searchRef.current?.blur();
                    return;
                }
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
                            STATUS_ORDER[parseInt(event.key) - 1]
                        );
                    }
                    break;
                case "x":
                    if (selectedUuid) {
                        onToggleSelection(selectedUuid);
                    }
                    break;
                case "/":
                    event.preventDefault();
                    searchRef.current?.focus();
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
            setLastChecklistId(null);
            router.push("/editor");
        }
    }, [confirm, checklist?.title, editor, router]);

    const handleAddStig = useCallback(
        async (stig: Stig) => {
            await editor.addStig(stig);
            setDrawer(null);
            toast({
                tone: "success",
                title: "STIG added",
                description: `"${stig.display_name}" was added to the checklist.`,
            });
        },
        [editor, toast]
    );

    const exportChecklist = useCallback(() => {
        if (!checklist) {
            return;
        }
        flush();
        toCKLB(checklist);
        toast({
            tone: "success",
            title: "Checklist exported",
            description: "The .cklb file is compatible with DISA STIG Viewer 3.",
        });
    }, [checklist, flush, toast]);

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
                description: `Status set to "${STATUS_NAME[status]}".`,
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
            flush,
        }),
        [editor, removeRule, flush]
    );

    const existingStigNames = useMemo(
        () => new Set(checklist?.stigs.map((stig) => stig.stig_name) ?? []),
        [checklist]
    );

    const clearFilters = useCallback(() => {
        setStatuses(new Set());
        setSeverities(new Set());
    }, []);

    const actions: ShellAction[] = useMemo(
        () => [
            {
                label: "Target metadata",
                icon: "metadata",
                onClick: () => {
                    setSelectedUuid(null);
                    setDrawer("metadata");
                },
            },
            {
                label: "Add STIG",
                icon: "plus",
                onClick: () => {
                    setSelectedUuid(null);
                    setDrawer("add-stig");
                },
            },
            {
                label: "Delete checklist",
                icon: "trash",
                tone: "danger",
                onClick: deleteChecklist,
            },
        ],
        [deleteChecklist]
    );

    if (missing) {
        return (
            <WorkbenchShell active="workbench">
                <div className="flex flex-1 items-center justify-center p-8">
                    <EmptyState
                        className="max-w-md bg-surface"
                        title="Checklist not found"
                        description="It was deleted, or it lives in another browser. Checklists are stored locally."
                        action={
                            <Link
                                href="/editor"
                                className={buttonClasses({
                                    variant: "primary",
                                    size: "sm",
                                })}
                            >
                                Back to checklists
                            </Link>
                        }
                    />
                </div>
            </WorkbenchShell>
        );
    }

    if (!checklist) {
        return (
            <WorkbenchShell active="workbench" checklistId={checklistId}>
                <LoadingColumns />
            </WorkbenchShell>
        );
    }

    const remaining = progress.counts[Status.NotReviewed];
    const hostName = checklist.target_data.host_name?.trim();

    const detail = selectedRule ? (
        <RuleDetail
            rule={selectedRule}
            handlers={detailHandlers}
            saveState={saveState}
            onPrevious={
                selectedPosition > 0 ? () => moveSelection(-1) : undefined
            }
            onNext={
                selectedPosition > -1 &&
                selectedPosition < visibleUuids.length - 1
                    ? () => moveSelection(1)
                    : undefined
            }
            onSaveAndNext={saveAndNext}
            onJumpToUnreviewed={jumpToUnreviewed}
            remaining={remaining}
            position={
                selectedPosition > -1
                    ? { index: selectedPosition, total: visibleUuids.length }
                    : undefined
            }
        />
    ) : null;

    return (
        <WorkbenchShell
            active="workbench"
            checklistId={checklist.id}
            progress={{
                label: hostName || checklist.title || "Untitled checklist",
                counts: progress,
            }}
            onExport={exportChecklist}
            actions={actions}
        >
            {checklist.stigs.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-8">
                    <EmptyState
                        className="max-w-md bg-surface"
                        title="This checklist has no STIGs yet"
                        description="Add a STIG to start assessing rules."
                        action={
                            <button
                                type="button"
                                onClick={() => setDrawer("add-stig")}
                                className={buttonClasses({
                                    variant: "primary",
                                    size: "sm",
                                })}
                            >
                                Add STIG
                            </button>
                        }
                    />
                </div>
            ) : (
                <>
                    <RuleList
                        title={checklist.title}
                        onTitleChange={editor.updateTitle}
                        query={query}
                        onQueryChange={setQuery}
                        searchRef={searchRef}
                        statuses={statuses}
                        severities={severities}
                        onToggleStatus={(status) =>
                            setStatuses((previous) => toggleIn(previous, status))
                        }
                        onToggleSeverity={(severity) =>
                            setSeverities((previous) =>
                                toggleIn(previous, severity)
                            )
                        }
                        onClearFilters={clearFilters}
                        counts={counts}
                        stigs={checklist.stigs}
                        visibleByStig={visibleByStig}
                        selectedUuid={selectedUuid}
                        selection={selection}
                        onSelectRule={onSelectRule}
                        onToggleSelection={onToggleSelection}
                        onSelectAll={onSelectAll}
                        onRemoveStig={removeStig}
                    />
                    <div className="hidden min-h-0 min-w-0 flex-1 flex-col lg:flex">
                        {detail ?? (
                            <div className="flex flex-1 items-center justify-center p-8">
                                <EmptyState
                                    className="max-w-md border-0"
                                    title="Select a rule to begin"
                                    description="Pick a rule on the left, or press j/k to move through the list and 1–4 to set its status."
                                    action={
                                        remaining > 0 ? (
                                            <button
                                                type="button"
                                                onClick={jumpToUnreviewed}
                                                className={buttonClasses({
                                                    variant: "primary",
                                                    size: "sm",
                                                })}
                                            >
                                                Start with the next unreviewed
                                                rule
                                            </button>
                                        ) : undefined
                                    }
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Below lg the detail pane opens as a drawer. */}
            <div className="lg:hidden">
                <Sidebar
                    isOpen={selectedRule !== null}
                    onClick={() => setSelectedUuid(null)}
                    headerText={selectedRule?.group_id ?? "Rule"}
                >
                    {detail}
                </Sidebar>
            </div>

            <Sidebar
                isOpen={drawer === "add-stig"}
                onClick={() => setDrawer(null)}
                headerText="Add STIG"
            >
                <AddStig
                    isOpen={drawer === "add-stig"}
                    existingStigNames={existingStigNames}
                    onAdd={handleAddStig}
                />
            </Sidebar>

            <Sidebar
                isOpen={drawer === "metadata"}
                onClick={() => setDrawer(null)}
                headerText="Target metadata"
            >
                {drawer === "metadata" && (
                    <div className="w-[min(90vw,36rem)]">
                        <ChecklistTargetData
                            checklist={checklist}
                            onChange={editor.updateTargetData}
                        />
                    </div>
                )}
            </Sidebar>

            {selection.size > 0 && (
                <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-overlay max-sm:w-[calc(100%-2rem)]">
                    <span className="whitespace-nowrap text-[12.5px] font-semibold text-foreground">
                        {selection.size} selected
                    </span>
                    <span className="text-[11px] text-subtle max-sm:hidden">
                        Set status:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {STATUS_ORDER.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => bulkSetStatus(status)}
                                className="rounded-[9px] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-wb-body transition-colors hover:border-border-strong hover:bg-surface-muted"
                            >
                                {STATUS_NAME[status]}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelection(new Set())}
                        className="text-xs font-semibold text-accent hover:underline"
                    >
                        Clear
                    </button>
                </div>
            )}
        </WorkbenchShell>
    );
};
