"use client";

import {
    Checklist,
    Rule,
    Severity,
    Status,
    Stig,
    TargetData,
} from "@/api/generated/Checklist";
import { IDB, IDBChecklist } from "@/app/db";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

const TEXT_DEBOUNCE = 500;

const toChecklistRecord = (checklist: Checklist): IDBChecklist => {
    const record = { ...checklist } as Partial<Checklist>;
    delete record.stigs;
    return record as IDBChecklist;
};

/**
 * Editor state for one checklist. The checklist lives in React state and
 * every mutation patches state immediately, then writes the full affected
 * records to IndexedDB (text fields debounced, status/severity at once).
 * Records are always written whole, so CKLB round-trip fields survive.
 */
export const useChecklistEditor = (checklistId: string) => {
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    /** True once the load settled without finding the checklist. */
    const [missing, setMissing] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>("idle");
    const checklistRef = useRef<Checklist | null>(null);
    checklistRef.current = checklist;

    // Pending debounced writes, keyed by `${scope}.${field}`.
    const pending = useRef(
        new Map<string, { timer: ReturnType<typeof setTimeout>; run: () => void }>()
    );
    const inflight = useRef(0);

    const refresh = useCallback(async () => {
        try {
            const next = await IDB.exportChecklist(checklistId);
            setChecklist(next);
            setMissing(next === null);
        } catch {
            // exportChecklist logs the cause; an unknown id is the usual one.
            setChecklist(null);
            setMissing(true);
        }
    }, [checklistId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const track = useCallback(async (write: Promise<unknown>) => {
        inflight.current++;
        setSaveState("saving");
        try {
            await write;
            inflight.current--;
            if (inflight.current === 0 && pending.current.size === 0) {
                setSaveState("saved");
            }
        } catch (error) {
            console.error("Checklist save failed:", error);
            inflight.current--;
            setSaveState("error");
        }
    }, []);

    const schedule = useCallback(
        (key: string, run: () => void, delay = TEXT_DEBOUNCE) => {
            const existing = pending.current.get(key);
            if (existing) {
                clearTimeout(existing.timer);
            }
            setSaveState("saving");
            const timer = setTimeout(() => {
                pending.current.delete(key);
                run();
            }, delay);
            pending.current.set(key, { timer, run });
        },
        []
    );

    /** Run all pending debounced writes now. */
    const flush = useCallback(() => {
        for (const [key, entry] of pending.current) {
            clearTimeout(entry.timer);
            pending.current.delete(key);
            entry.run();
        }
    }, []);

    /** Drop pending writes for a removed scope (rule uuid, checklist id). */
    const cancel = useCallback((scope: string) => {
        for (const [key, entry] of pending.current) {
            if (key.startsWith(`${scope}.`)) {
                clearTimeout(entry.timer);
                pending.current.delete(key);
            }
        }
    }, []);

    useEffect(() => {
        const onBeforeUnload = () => flush();
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
            flush();
        };
    }, [flush]);

    const patchRules = useCallback(
        (uuids: Set<string>, patch: (rule: Rule) => Rule) => {
            setChecklist((previous) => {
                if (!previous) {
                    return previous;
                }
                return {
                    ...previous,
                    stigs: previous.stigs.map((stig) =>
                        stig.rules.some((rule) => uuids.has(rule.uuid))
                            ? {
                                  ...stig,
                                  rules: stig.rules.map((rule) =>
                                      uuids.has(rule.uuid)
                                          ? patch(rule)
                                          : rule
                                  ),
                              }
                            : stig
                    ),
                };
            });
        },
        []
    );

    const findRule = useCallback((uuid: string): Rule | undefined => {
        for (const stig of checklistRef.current?.stigs ?? []) {
            const rule = stig.rules.find((r) => r.uuid === uuid);
            if (rule) {
                return rule;
            }
        }
        return undefined;
    }, []);

    const writeRule = useCallback(
        (uuid: string) => {
            const rule = findRule(uuid);
            if (rule) {
                track(IDB.rules.put(rule));
            }
        },
        [findRule, track]
    );

    /** Debounced text-field update (comments, finding details). */
    const updateRuleText = useCallback(
        (
            uuid: string,
            field: "comments" | "finding_details",
            value: string
        ) => {
            patchRules(new Set([uuid]), (rule) => ({
                ...rule,
                [field]: value,
            }));
            schedule(`${uuid}.${field}`, () => writeRule(uuid));
        },
        [patchRules, schedule, writeRule]
    );

    /** Immediate status write for one or many rules (bulk uses one txn). */
    const setStatus = useCallback(
        (uuids: string[], status: Status) => {
            const set = new Set(uuids);
            // Compute the records directly; the ref may not reflect the
            // state patch until the next render.
            const records = uuids
                .map((uuid) => findRule(uuid))
                .filter((rule): rule is Rule => !!rule)
                .map((rule) => ({ ...rule, status }));
            patchRules(set, (rule) => ({ ...rule, status }));
            track(IDB.rules.putMany(records));
        },
        [patchRules, findRule, track]
    );

    const withSeverityOverride = useCallback(
        (rule: Rule, severity: Severity, reason?: string): Rule => {
            const overrides = { ...rule.overrides };
            if (severity === rule.severity) {
                delete overrides.severity;
            } else {
                overrides.severity = {
                    severity,
                    reason: reason ?? rule.overrides?.severity?.reason ?? "",
                };
            }
            return { ...rule, overrides };
        },
        []
    );

    /** Severity override; clears the override when set back to the base. */
    const setSeverity = useCallback(
        (uuid: string, severity: Severity, reason?: string) => {
            const rule = findRule(uuid);
            if (!rule) {
                return;
            }
            const next = withSeverityOverride(rule, severity, reason);
            patchRules(new Set([uuid]), (r) =>
                withSeverityOverride(r, severity, reason)
            );
            track(IDB.rules.put(next));
        },
        [findRule, withSeverityOverride, patchRules, track]
    );

    const setOverrideReason = useCallback(
        (uuid: string, reason: string) => {
            patchRules(new Set([uuid]), (rule) =>
                rule.overrides?.severity
                    ? {
                          ...rule,
                          overrides: {
                              ...rule.overrides,
                              severity: {
                                  ...rule.overrides.severity,
                                  reason,
                              },
                          },
                      }
                    : rule
            );
            schedule(`${uuid}.override_reason`, () => writeRule(uuid));
        },
        [patchRules, schedule, writeRule]
    );

    const writeChecklistRecord = useCallback(() => {
        const current = checklistRef.current;
        if (current) {
            track(IDB.checklists.put(toChecklistRecord(current)));
        }
    }, [track]);

    const updateTitle = useCallback(
        (title: string) => {
            setChecklist((previous) =>
                previous ? { ...previous, title } : previous
            );
            schedule(`${checklistId}.title`, writeChecklistRecord);
        },
        [checklistId, schedule, writeChecklistRecord]
    );

    const updateTargetData = useCallback(
        (patch: Partial<TargetData>) => {
            setChecklist((previous) =>
                previous
                    ? {
                          ...previous,
                          target_data: {
                              ...previous.target_data,
                              ...patch,
                          },
                      }
                    : previous
            );
            schedule(`${checklistId}.target_data`, writeChecklistRecord);
        },
        [checklistId, schedule, writeChecklistRecord]
    );

    const removeRule = useCallback(
        async (uuid: string) => {
            cancel(uuid);
            await IDB.rules.del(uuid);
            await refresh();
        },
        [cancel, refresh]
    );

    const removeStig = useCallback(
        async (stig: Stig) => {
            stig.rules.forEach((rule) => cancel(rule.uuid));
            await IDB.removeStig(checklistId, stig.uuid);
            await refresh();
        },
        [cancel, checklistId, refresh]
    );

    const addStig = useCallback(
        async (stig: Stig) => {
            await IDB.addStig(checklistId, stig);
            await refresh();
        },
        [checklistId, refresh]
    );

    const deleteChecklist = useCallback(async () => {
        // Drop every pending write before the records disappear.
        for (const entry of pending.current.values()) {
            clearTimeout(entry.timer);
        }
        pending.current.clear();
        await IDB.removeChecklist(checklistId);
    }, [checklistId]);

    const rules = useMemo(
        () => checklist?.stigs.flatMap((stig) => stig.rules) ?? [],
        [checklist]
    );

    return {
        checklist,
        missing,
        rules,
        saveState,
        refresh,
        flush,
        updateRuleText,
        setStatus,
        setSeverity,
        setOverrideReason,
        updateTitle,
        updateTargetData,
        addStig,
        removeRule,
        removeStig,
        deleteChecklist,
    };
};
