"use client";
import {
    Pill,
    SEVERITY_LABEL,
    severityTone,
} from "@/app/components/client/editor/rule_meta";
import { ContentNavigation } from "@/app/components/content_navigation";
import { GroupInfo } from "@/app/components/rule_panel";
import { EmptyState } from "@/app/components/ui/empty_state";
import { useStigContext } from "@/app/context/stig";
import { Suspense } from "react";
import { Breadcrumbs } from "./breadcrumbs";

export { GroupInfo } from "@/app/components/rule_panel";

const Identifier = ({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex items-baseline justify-between gap-3 text-xs text-muted">
        <dt className="shrink-0 text-subtle">{label}</dt>
        <dd className="break-all text-right font-plex-mono text-[11.5px] font-medium">
            {value}
        </dd>
    </div>
);

export const GroupView = ({
    stigId,
    groupId,
    classification,
}: {
    stigId: string;
    groupId: string;
    classification?: string;
}) => {
    const stig = useStigContext();
    const idx = stig.groups.findIndex((group) => group.id === groupId);
    const group = stig.groups[idx];

    if (!group) {
        return (
            <section className="flex w-full flex-col gap-4">
                <Breadcrumbs stigId={stigId} />
                <EmptyState
                    className="bg-surface"
                    title="Rule not found"
                    description={`"${groupId}" is not part of this STIG${
                        classification ? ` (${classification})` : ""
                    }.`}
                />
            </section>
        );
    }

    const severity = group.rule.severity;

    return (
        <Suspense>
            <Breadcrumbs stigId={stigId} group={group} />

            <header className="flex w-full flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-plex-mono text-xs font-semibold text-muted">
                        {group.id}
                    </span>
                    <Pill tone={severityTone[severity]} size="md">
                        {SEVERITY_LABEL[severity].cat} —{" "}
                        {SEVERITY_LABEL[severity].name} severity
                    </Pill>
                    <span className="font-plex-mono text-[11px] text-wb-faint">
                        {group.rule.id}
                    </span>
                </div>
                <h1 className="max-w-[56ch] text-[19px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
                    {group.rule.title}
                </h1>
                <p className="text-[11px] text-subtle">
                    Rule version {group.rule.version} · STIG v{stig.version} ·{" "}
                    {stig.date}
                </p>
            </header>

            <ContentNavigation
                stigId={stigId}
                previous={stig.groups[idx - 1]}
                next={stig.groups[idx + 1]}
                index={idx}
                total={stig.groups.length}
                withKeyboard
            />

            <div className="grid w-full items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex min-w-0 flex-col gap-3.5">
                    <GroupInfo group={group} />
                </div>
                <section className="rounded-[14px] border border-border bg-surface px-[18px] py-4 shadow-wb-card dark:shadow-none">
                    <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[.07em] text-subtle">
                        Identifiers
                    </h2>
                    <dl className="flex flex-col gap-[9px]">
                        <Identifier label="Group ID" value={group.id} />
                        <Identifier label="Group title" value={group.title} />
                        <Identifier label="Rule ID" value={group.rule.id} />
                        <Identifier
                            label="Check ID"
                            value={group.rule.checkId}
                        />
                        <Identifier label="Fix ID" value={group.rule.fix} />
                    </dl>
                </section>
            </div>

            <ContentNavigation
                stigId={stigId}
                previous={stig.groups[idx - 1]}
                next={stig.groups[idx + 1]}
                index={idx}
                total={stig.groups.length}
                slim
            />
        </Suspense>
    );
};
