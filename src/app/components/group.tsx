"use client";
import { GroupWrapper } from "@/api/entities/Stig";
import { ContentNavigation } from "@/app/components/content_navigation";
import { SeverityBadge } from "@/app/components/severity";
import { TableCard } from "@/app/components/ui/card";
import { useStigContext } from "@/app/context/stig";
import { Suspense } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { Table } from "./table";

const InfoPanel = ({
    title,
    children,
}: {
    title: React.ReactNode;
    children: React.ReactNode;
}) => (
    <section className="w-full flex flex-col">
        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
            <h3 className="px-6 py-3.5 text-xs font-semibold tracking-wide uppercase text-muted bg-surface-muted border-b border-border">
                {title}
            </h3>
            <div className="px-6 py-4 text-sm text-foreground whitespace-pre-line">
                {children}
            </div>
        </div>
    </section>
);

export const GroupInfo = ({ group }: { group: GroupWrapper }) => (
    <>
        <InfoPanel title="Description">{group.rule.description}</InfoPanel>
        <InfoPanel title="ℹ️ Check">{group.rule.check}</InfoPanel>
        <InfoPanel title="✔️ Fix">{group.rule.fixText}</InfoPanel>
    </>
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
        return null;
    }

    return (
        <Suspense>
            <Breadcrumbs stigId={stigId} group={group} />

            <section className="w-full flex flex-col">
                <h1 className="text-3xl font-semibold tracking-tight my-6 text-foreground">
                    {group.rule.title}
                </h1>
                <TableCard>
                    <Table
                        tableHeaders={[
                            {
                                text: "Severity",
                            },
                            {
                                text: "Group ID",
                            },
                            {
                                text: "Group Title",
                                className: "max-md:hidden",
                            },
                            {
                                text: "Version",
                            },
                            {
                                text: "Rule ID",
                                className: "max-md:hidden",
                            },
                            {
                                text: "Date",
                                className: "max-lg:hidden",
                            },
                            {
                                text: "STIG Version",
                                className: "max-lg:hidden",
                            },
                        ]}
                        tableBody={[
                            {
                                classNames: [
                                    null,
                                    null,
                                    "max-md:hidden",
                                    null,
                                    "max-md:hidden",
                                    "max-lg:hidden",
                                    "max-lg:hidden",
                                ],
                                values: [
                                    group.rule.severity,
                                    group.id,
                                    group.title,
                                    group.rule.version,
                                    group.rule.id,
                                    stig.date,
                                    stig.version,
                                ],
                                columns: [
                                    <SeverityBadge
                                        severity={group.rule.severity}
                                    />,
                                    group.id,
                                    group.title,
                                    group.rule.version,
                                    group.rule.id,
                                    stig.date,
                                    stig.version,
                                ],
                            },
                        ]}
                    />
                </TableCard>
            </section>
            <ContentNavigation
                stigId={stigId}
                previous={stig.groups[idx - 1]}
                next={stig.groups[idx + 1]}
            />
            <GroupInfo group={group} />
        </Suspense>
    );
};
