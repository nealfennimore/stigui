"use client";
import Checklist from "@/api/entities/Checklist";
import { Classification, StigWrapper } from "@/api/entities/Stig";
import { Severity } from "@/api/generated/Checklist";
import { Icon } from "@/app/components/client/editor/icons";
import {
    FilterPill,
    Pill,
    SEVERITY_LABEL,
    severityTone,
} from "@/app/components/client/editor/rule_meta";
import { ExportMenu } from "@/app/components/export_menu";
import { GroupInfo } from "@/app/components/rule_panel";
import { Sidebar } from "@/app/components/sidebar";
import { buttonClasses } from "@/app/components/ui/button";
import { TableCard } from "@/app/components/ui/card";
import { EmptyState } from "@/app/components/ui/empty_state";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { useStigContext } from "@/app/context/stig";
import { IDB } from "@/app/db";
import { useKeyboardListNav } from "@/app/hooks/use_keyboard_nav";
import { recordView } from "@/app/recently_viewed";
import { download } from "@/app/utils";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { bySeverity } from "./severity";
import { defaultFilter, defaultSort, Order, Table } from "./table";

const sorters = [defaultSort, bySeverity, defaultSort, null];
const filters = [null, null, defaultFilter, defaultFilter];
const tableHeaders = [
    {
        text: "Group ID",
    },
    {
        text: "Severity",
        className: "text-center",
    },
    {
        text: "Title",
    },
    {
        text: "Description",
        className: "max-lg:hidden",
    },
];

const toCSV = (stig: StigWrapper) => {
    const csv = [
        [
            "Group ID",
            "Severity",
            "Title",
            "Description",
            "Rule ID",
            "Fix ID",
            "Fix Text",
            "Check ID",
            "Check Text",
        ].join(","),
        ...stig.groups.map((group) => {
            return [
                group.id,
                group.rule.severity,
                `"${group.rule.title.replaceAll('"', "'")}"`,
                `"${group.rule.description.replaceAll('"', "'")}"`,
                group.rule.id,
                group.rule.fix,
                `"${group.rule.fixText.replaceAll('"', "'")}"`,
                group.rule.checkId,
                `"${group.rule.check.replaceAll('"', "'")}"`,
            ].join(",");
        }),
    ];

    const blob = new Blob([csv.join("\n")], {
        type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    download(url, `${stig.id}.csv`);
    URL.revokeObjectURL(url);
};

const toEditor = async (
    stig: StigWrapper,
    classification: Classification,
    router: AppRouterInstance
) => {
    const checklist = Checklist.fromStig(
        stig.stig,
        Object.values(stig.rawProfilesByClassification[classification]).flat()
    );
    await IDB.importChecklist(checklist);
    router.push(`/editor?id=${checklist.id}`);
};

const ClassificationLink = ({
    classification,
    selectedClassification,
    stigId,
}: {
    classification: Classification;
    selectedClassification: Classification;
    stigId: string;
}) => {
    const isSelected = classification === selectedClassification;
    return (
        <Link
            href={`/stigs/${stigId}/${classification}`}
            aria-current={isSelected ? "page" : undefined}
            className={`inline-flex items-center whitespace-nowrap rounded-[20px] border px-[11px] py-1 text-[11.5px] font-medium transition-colors ${
                isSelected
                    ? "border-transparent bg-contrast-surface text-contrast-foreground"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
        >
            {classification}
        </Link>
    );
};

const SeverityLabel = ({ severity }: { severity: Severity }) => (
    <Pill tone={severityTone[severity]}>
        {SEVERITY_LABEL[severity].cat} · {SEVERITY_LABEL[severity].name}
    </Pill>
);

const navButtonClasses =
    "rounded-[9px] border border-border bg-surface p-1.5 text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-foreground";

export const StigView = ({
    stigId,
    classification,
}: {
    stigId: string;
    classification?: Classification;
}) => {
    const stig = useStigContext();
    const router = useRouter();
    const [severities, setSeverities] = useState<Set<Severity>>(new Set());
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
        null
    );
    const [visibleGroupIds, setVisibleGroupIds] = useState<string[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const classificationLevel = classification || Classification.Public;

    useEffect(() => {
        recordView(stig.id, stig.title);
    }, [stig.id, stig.title]);

    const groups = useMemo(
        () =>
            stig.groupsByProfiles(
                Object.values(
                    stig.profilesByClassification[classificationLevel]
                ).flat()
            ),
        [stig, classificationLevel]
    );

    const groupById = useMemo(() => {
        const map = new Map<string, (typeof groups)[keyof typeof groups]>();
        Object.values(groups).forEach((group) => map.set(group.id, group));
        return map;
    }, [groups]);

    const counts = useMemo(() => {
        const counts = {} as Record<Severity, number>;
        Object.values(groups).forEach((group) => {
            if (!counts[group.rule.severity]) {
                counts[group.rule.severity] = 0;
            }
            counts[group.rule.severity]++;
        });
        return Object.entries(counts).sort(([a], [b]) =>
            bySeverity(b as Severity, a as Severity)
        );
    }, [groups]);

    const totalCount = Object.keys(groups).length;

    // Selection is by group id; clear it when it leaves the visible set
    // (filter change, classification switch).
    const group = selectedGroupId ? groupById.get(selectedGroupId) : undefined;

    const tableBody = useMemo(
        () =>
            Object.values(groups)
                .filter((group) => {
                    if (severities.size === 0) {
                        return true;
                    }
                    return severities.has(group.rule.severity);
                })
                .map((group) => ({
                    onClick: () => setSelectedGroupId(group.id),
                    values: [
                        group.id,
                        group.rule.severity,
                        group.rule.title,
                        group.rule.description,
                    ],
                    columns: [
                        <Link
                            className="flex flex-col whitespace-nowrap font-plex-mono text-[11.5px] font-semibold text-muted hover:text-accent hover:underline"
                            href={`/stigs/${stigId}/groups/${group.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {group.id}
                        </Link>,
                        <SeverityLabel severity={group.rule.severity} />,
                        group.rule.title,
                        group.rule.description,
                    ],
                    classNames: [null, null, null, "max-lg:hidden"],
                })),
        [groups, stigId, severities]
    );

    const rowKey = useCallback(
        (row: { values: string[] }) => row.values[0],
        []
    );
    const onVisibleRowsChange = useCallback((keys: string[]) => {
        setVisibleGroupIds(keys);
        setSelectedGroupId((previous) =>
            previous && !keys.includes(previous) ? null : previous
        );
    }, []);

    const moveSelection = useCallback(
        (delta: -1 | 1) => {
            setSelectedGroupId((previous) => {
                if (!visibleGroupIds.length) {
                    return previous;
                }
                if (!previous) {
                    return visibleGroupIds[0];
                }
                const index = visibleGroupIds.indexOf(previous);
                const next = Math.min(
                    Math.max(index + delta, 0),
                    visibleGroupIds.length - 1
                );
                return visibleGroupIds[next];
            });
        },
        [visibleGroupIds]
    );

    useKeyboardListNav({
        onMove: moveSelection,
        onEnter: useCallback(() => {
            if (group) {
                router.push(`/stigs/${stigId}/groups/${group.id}`);
            }
        }, [group, router, stigId]),
        onEscape: useCallback(() => setSelectedGroupId(null), []),
    });

    const classifications = useMemo(() => Object.values(Classification), []);

    const toggleSeverity = (severity: Severity) => {
        const newSeverities = new Set(severities);
        if (newSeverities.has(severity)) {
            newSeverities.delete(severity);
        } else {
            newSeverities.add(severity);
        }
        setSeverities(newSeverities);
    };

    return (
        <Suspense fallback={<SkeletonTable rows={8} />}>
            <Breadcrumbs stigId={stigId} />
            <Sidebar
                isOpen={!!group}
                onClick={() => setSelectedGroupId(null)}
                headerText={
                    group && (
                        <Link
                            className="font-plex-mono hover:underline"
                            href={`/stigs/${stigId}/groups/${group.id}`}
                        >
                            {group.id}
                        </Link>
                    )
                }
                headerActions={
                    group && (
                        <>
                            <button
                                type="button"
                                aria-label="Previous rule"
                                onClick={() => moveSelection(-1)}
                                className={navButtonClasses}
                            >
                                <Icon.chevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next rule"
                                onClick={() => moveSelection(1)}
                                className={navButtonClasses}
                            >
                                <Icon.chevronRight className="h-3.5 w-3.5" />
                            </button>
                        </>
                    )
                }
            >
                {group && (
                    <div className="flex w-[min(90vw,40rem)] flex-col gap-3.5">
                        <div className="flex flex-col gap-2">
                            <SeverityLabel severity={group.rule.severity} />
                            <h2 className="text-[15px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground">
                                {group.rule.title}
                            </h2>
                        </div>
                        <GroupInfo group={group} compact />
                        <div className="flex flex-row items-center justify-start">
                            <Link
                                className={buttonClasses({
                                    variant: "primary",
                                    size: "sm",
                                })}
                                href={`/stigs/${stigId}/groups/${group.id}`}
                            >
                                Open {group.id}
                            </Link>
                        </div>
                    </div>
                )}
            </Sidebar>

            <header className="flex w-full flex-col gap-2">
                <h1 className="text-[19px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                    {stig.title}
                </h1>
                <p className="text-[11px] text-subtle">
                    Version {stig.version} · Released {stig.date} ·{" "}
                    {totalCount} rules
                </p>
                <div>
                    <p
                        className={`max-w-[80ch] text-[12.5px] leading-[1.6] text-muted [text-wrap:pretty] ${
                            showFullDescription ? "" : "line-clamp-3"
                        }`}
                    >
                        {stig.description}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            setShowFullDescription(!showFullDescription)
                        }
                        className="mt-1 text-[11.5px] font-semibold text-wb-nav-active-foreground hover:underline"
                    >
                        {showFullDescription ? "Show less" : "Show more"}
                    </button>
                </div>
            </header>

            <section className="flex w-full flex-wrap items-center justify-between gap-4">
                <nav
                    aria-label="Classification profile"
                    className="flex flex-wrap items-center gap-1.5"
                >
                    {classifications.map((item) => (
                        <ClassificationLink
                            key={item}
                            stigId={stigId}
                            classification={item}
                            selectedClassification={classificationLevel}
                        />
                    ))}
                </nav>
                <div className="flex flex-wrap items-center gap-2">
                    <ExportMenu
                        options={[
                            {
                                label: "XML",
                                onSelect: () =>
                                    download(
                                        `/data/stigs/schema/${stig.id}.xml`,
                                        `${stig.id}.xml`
                                    ),
                            },
                            {
                                label: "JSON",
                                onSelect: () =>
                                    download(
                                        `/data/stigs/schema/${stig.id}.json`,
                                        `${stig.id}.json`
                                    ),
                            },
                            {
                                label: "CSV",
                                onSelect: () => toCSV(stig),
                            },
                        ]}
                    />
                    <button
                        onClick={() =>
                            toEditor(stig, classificationLevel, router)
                        }
                        className={buttonClasses({
                            variant: "primary",
                            size: "sm",
                        })}
                    >
                        Edit checklist
                    </button>
                </div>
            </section>

            <section className="flex w-full flex-col">
                <TableCard>
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface px-4 py-3">
                        <FilterPill
                            active={severities.size === 0}
                            count={totalCount}
                            onClick={() => setSeverities(new Set())}
                        >
                            All
                        </FilterPill>
                        {counts.map(([severity, count]) => (
                            <FilterPill
                                key={severity}
                                active={severities.has(severity as Severity)}
                                count={count}
                                onClick={() =>
                                    toggleSeverity(severity as Severity)
                                }
                            >
                                {SEVERITY_LABEL[severity as Severity].cat}
                            </FilterPill>
                        ))}
                    </div>
                    {tableBody.length === 0 ? (
                        <EmptyState
                            className="m-4 border-0"
                            title="No rules match the current filters"
                            description="Clear the severity filters to see all rules."
                        />
                    ) : (
                        <form
                            ref={formRef}
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <Table
                                sorters={sorters}
                                filters={filters}
                                tableHeaders={tableHeaders}
                                tableBody={tableBody}
                                initialOrders={[
                                    Order.ASC,
                                    Order.DESC,
                                    Order.NONE,
                                ]}
                                formRef={formRef}
                                caption={`Rules in ${stig.title}`}
                                rowKey={rowKey}
                                selectedKey={selectedGroupId}
                                onVisibleRowsChange={onVisibleRowsChange}
                                mobile={{
                                    primaryColumn: 2,
                                    hiddenColumns: [3],
                                }}
                            />
                        </form>
                    )}
                </TableCard>
            </section>
        </Suspense>
    );
};
