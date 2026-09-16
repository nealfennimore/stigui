"use client";
import Checklist from "@/api/entities/Checklist";
import { Classification, StigWrapper } from "@/api/entities/Stig";
import { Severity } from "@/api/generated/Checklist";
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
import { bySeverity, SeverityBadge } from "./severity";
import { Badge } from "./ui/badge";
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
    index,
    lastIndex,
    stigId,
}: {
    classification: Classification;
    selectedClassification: Classification;
    index: number;
    lastIndex: number;
    stigId: string;
}) => {
    const isSelected = classification === selectedClassification;
    const selectedClassName = isSelected
        ? "bg-accent text-accent-foreground border-accent z-10"
        : "bg-surface text-muted hover:bg-surface-muted hover:text-foreground";

    const idxClassName = index === 0 ? "rounded-s-md" : "-ml-px";
    const idxClassName2 = index === lastIndex ? "rounded-e-md" : "";

    return (
        <Link
            href={`/stigs/${stigId}/${classification}`}
            aria-current={isSelected ? "page" : undefined}
            className={`px-3 py-1.5 text-sm font-medium border border-border-strong focus:z-10 transition-colors ${selectedClassName} ${idxClassName} ${idxClassName2}`}
        >
            {classification}
        </Link>
    );
};

const chevron = (direction: "prev" | "next") => (
    <svg
        aria-hidden="true"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
    </svg>
);

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
                            className="flex flex-col whitespace-nowrap font-medium text-accent hover:underline"
                            href={`/stigs/${stigId}/groups/${group.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {group.id}
                        </Link>,
                        <SeverityBadge severity={group.rule.severity} />,
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
                        <Link href={`/stigs/${stigId}/groups/${group.id}`}>
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
                                className="p-1.5 rounded-md text-subtle hover:bg-surface-muted hover:text-foreground transition-colors"
                            >
                                {chevron("prev")}
                            </button>
                            <button
                                type="button"
                                aria-label="Next rule"
                                onClick={() => moveSelection(1)}
                                className="p-1.5 rounded-md text-subtle hover:bg-surface-muted hover:text-foreground transition-colors"
                            >
                                {chevron("next")}
                            </button>
                        </>
                    )
                }
            >
                {group && (
                    <>
                        <div className="flex items-center gap-1 flex-wrap">
                            <SeverityBadge severity={group.rule.severity} />
                            <span className="text-sm font-medium text-foreground">
                                {group.rule.title}
                            </span>
                        </div>
                        <GroupInfo group={group} compact />
                        <div className="flex flex-row justify-start items-center">
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
                    </>
                )}
            </Sidebar>

            <header className="w-full flex flex-col gap-2 mt-6">
                <h1 className="text-3xl max-sm:text-2xl font-semibold tracking-tight text-foreground">
                    {stig.title}
                </h1>
                <p className="text-xs text-subtle">
                    Version {stig.version} · Released {stig.date} ·{" "}
                    {totalCount} rules
                </p>
                <div>
                    <p
                        className={`text-sm discussion ${
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
                        className="text-xs font-medium text-accent hover:underline mt-1"
                    >
                        {showFullDescription ? "Show less" : "Show more"}
                    </button>
                </div>
            </header>

            <section className="w-full flex justify-between items-center gap-4 flex-wrap">
                <nav
                    aria-label="Classification profile"
                    className="inline-flex"
                >
                    {classifications.map((item, index) => (
                        <ClassificationLink
                            key={item}
                            stigId={stigId}
                            classification={item}
                            selectedClassification={classificationLevel}
                            index={index}
                            lastIndex={classifications.length - 1}
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

            <section className="w-full flex flex-col">
                <TableCard>
                    <div className="flex items-center gap-1 flex-wrap px-4 py-3 border-b border-border bg-surface">
                        <Badge
                            tone="neutral"
                            count={totalCount}
                            selected={severities.size === 0}
                            onClick={() => setSeverities(new Set())}
                        >
                            All
                        </Badge>
                        {counts.map(([severity, count]) => (
                            <SeverityBadge
                                key={severity}
                                severity={severity as Severity}
                                count={count}
                                selected={severities.has(severity as Severity)}
                                onClick={() =>
                                    toggleSeverity(severity as Severity)
                                }
                            />
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
