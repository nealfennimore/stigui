"use client";
import Checklist from "@/api/entities/Checklist";
import { Classification, StigWrapper } from "@/api/entities/Stig";
import type { Stig as ChecklistStig } from "@/api/generated/Checklist";
import { buttonClasses } from "@/app/components/ui/button";
import { Field, Select } from "@/app/components/ui/field";
import { useManifestContext } from "@/app/context/manifest";
import { useMemo, useState } from "react";

type Props = {
    isOpen: boolean;
    existingStigNames?: Set<string>;
    onAdd: (stig: ChecklistStig) => Promise<void>;
};

export const AddStig = ({ isOpen, existingStigNames, onAdd }: Props) => {
    const manifest = useManifestContext();
    const [stigId, setStigId] = useState("");
    const [wrapper, setWrapper] = useState<StigWrapper | null>(null);
    const [classification, setClassification] = useState<Classification | "">(
        ""
    );
    const [loadingStig, setLoadingStig] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const classifications = useMemo(
        () =>
            wrapper
                ? (Object.keys(
                      wrapper.rawProfilesByClassification
                  ) as Classification[])
                : [],
        [wrapper]
    );

    const onSelectStig = async (id: string) => {
        setStigId(id);
        setWrapper(null);
        setClassification("");
        setError(null);
        if (!id) {
            return;
        }
        setLoadingStig(true);
        try {
            const loaded = await manifest.getStig(id);
            setWrapper(loaded);
            const available = Object.keys(
                loaded.rawProfilesByClassification
            ) as Classification[];
            const next = available.includes(Classification.Public)
                ? Classification.Public
                : available[0] ?? "";
            setClassification(next);
        } catch (e) {
            console.error(e);
            setError("Could not load that STIG. Please try another.");
        } finally {
            setLoadingStig(false);
        }
    };

    const onConfirm = async () => {
        if (!wrapper || !classification) {
            return;
        }
        setAdding(true);
        setError(null);
        try {
            const checklist = Checklist.fromStig(
                wrapper.stig,
                Object.values(
                    wrapper.rawProfilesByClassification[classification]
                ).flat()
            );
            await onAdd(checklist.stigs[0]);
            // Reset for a possible subsequent add.
            setStigId("");
            setWrapper(null);
            setClassification("");
        } catch (e) {
            console.error(e);
            setError("Could not add that STIG. Please try again.");
        } finally {
            setAdding(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    const alreadyAdded =
        !!wrapper && !!existingStigNames?.has(wrapper.stig.Benchmark.title);

    return (
        <section className="my-2 flex flex-col gap-6">
            <p className="text-sm text-muted">
                Add another STIG&apos;s rules to this checklist. Pick a STIG and
                a classification to pull its rules in.
            </p>

            <Field label="STIG" htmlFor="add-stig-id">
                <Select
                    id="add-stig-id"
                    value={stigId}
                    onChange={(e) => onSelectStig(e.target.value)}
                >
                    <option value="">Select a STIG…</option>
                    {manifest.elements.map((element) => (
                        <option key={element.id} value={element.id}>
                            {element.title} ({element.version})
                        </option>
                    ))}
                </Select>
            </Field>

            <Field label="Classification" htmlFor="add-stig-classification">
                <Select
                    id="add-stig-classification"
                    value={classification}
                    disabled={!wrapper || loadingStig}
                    onChange={(e) =>
                        setClassification(e.target.value as Classification)
                    }
                >
                    {classifications.length === 0 && (
                        <option value="">—</option>
                    )}
                    {classifications.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </Select>
            </Field>

            {loadingStig && (
                <p className="text-sm text-muted">Loading STIG…</p>
            )}
            {alreadyAdded && (
                <p className="text-sm text-muted">
                    This STIG is already in the checklist. Adding it again will
                    create a second copy.
                </p>
            )}
            {error && <p className="text-sm text-red-800 dark:text-red-300">{error}</p>}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!wrapper || !classification || adding}
                    className={buttonClasses({
                        variant: "primary",
                        size: "sm",
                    })}
                >
                    {adding ? "Adding…" : "Add STIG"}
                </button>
            </div>
        </section>
    );
};
