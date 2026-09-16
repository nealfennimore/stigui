"use client";
import { ContentNavigation } from "@/app/components/content_navigation";
import { GroupInfo } from "@/app/components/rule_panel";
import { SeverityBadge } from "@/app/components/severity";
import { Disclosure } from "@/app/components/ui/disclosure";
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
    <div className="flex items-center gap-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
            {label}
        </dt>
        <dd className="text-sm text-foreground font-[family-name:var(--font-geist-mono)]">
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
            <section className="w-full flex flex-col gap-4 my-6">
                <EmptyState
                    title="Rule not found"
                    description={`"${groupId}" is not part of this STIG${
                        classification ? ` (${classification})` : ""
                    }.`}
                />
            </section>
        );
    }

    return (
        <Suspense>
            <Breadcrumbs stigId={stigId} group={group} />

            <header className="w-full flex flex-col gap-2 my-6">
                <div className="flex items-center gap-1 flex-wrap">
                    <SeverityBadge severity={group.rule.severity} />
                    <span className="text-sm text-muted font-[family-name:var(--font-geist-mono)]">
                        {group.id}
                    </span>
                </div>
                <h1 className="text-3xl max-sm:text-2xl font-semibold tracking-tight text-foreground">
                    {group.rule.title}
                </h1>
                <p className="text-xs text-subtle">
                    {group.rule.id} · Version {group.rule.version} · STIG v
                    {stig.version} · {stig.date}
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

            <div className="w-full flex flex-col gap-6">
                <GroupInfo group={group} />

                <Disclosure summary="Identifiers">
                    <dl className="p-5 flex flex-col gap-2">
                        <Identifier label="Group ID" value={group.id} />
                        <Identifier label="Group Title" value={group.title} />
                        <Identifier label="Rule ID" value={group.rule.id} />
                        <Identifier
                            label="Check ID"
                            value={group.rule.checkId}
                        />
                        <Identifier label="Fix ID" value={group.rule.fix} />
                    </dl>
                </Disclosure>

                <ContentNavigation
                    stigId={stigId}
                    previous={stig.groups[idx - 1]}
                    next={stig.groups[idx + 1]}
                    index={idx}
                    total={stig.groups.length}
                    slim
                />
            </div>
        </Suspense>
    );
};
