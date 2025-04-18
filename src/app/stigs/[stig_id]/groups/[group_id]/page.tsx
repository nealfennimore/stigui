import * as Framework from "@/api/entities/Manifest";
import Stig, { GroupWrapper } from "@/api/entities/Stig";
import { Footer } from "@/app/components/footer";
import { GroupView } from "@/app/components/group";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import ManifestComponent from "@/app/context/manifest";
import StigComponent from "@/app/context/stig";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: Promise<{ stig_id: string; group_id: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { stig_id, group_id } = await params;
    const stig = await Stig.read(`${stig_id}.json`);
    const group = stig.groups.find(
        (group) => group.id === group_id
    ) as GroupWrapper;

    return {
        title: `STIGs | ${stig.metaTitle} | ${group.rule.title}`,
        description: group.rule.description,
        creator: group.rule.reference.publisher,
        publisher: group.rule.reference.publisher,
        keywords: [
            group.id,
            group.rule.checkId,
            group.rule.fix,
            group.rule.severity,
            group.rule.version,
        ],
        applicationName: "STIGUI",
        openGraph: {
            type: "article",
            title: `STIGs | ${stig.metaTitle} | ${group.rule.title}`,
            description: group.rule.description,
            url: `https://stig.neal.codes/stigs/${stig_id}/groups/${group_id}`,
            siteName: "STIGUI",
            tags: [
                group.id,
                group.rule.checkId,
                group.rule.fix,
                group.rule.severity,
                group.rule.version,
            ],
            publishedTime: new Date(stig.date).toISOString(),
        },
    };
}

export async function generateStaticParams() {
    const manifest = await Framework.Manifest.init();

    return (
        await Promise.all([
            ...manifest.elements.flatMap(async (element) => {
                const stig = await manifest.getStig(element.id);
                return stig?.groups.flatMap((group) => {
                    return {
                        stig_id: element.id,
                        group_id: group.id,
                    };
                });
            }),
        ])
    ).flat();
}

export default async function Page({
    params,
}: {
    params: Promise<{ stig_id: string; group_id: string }>;
}) {
    const { stig_id, group_id } = await params;

    return (
        <ManifestComponent>
            <StigComponent stigId={stig_id}>
                <Navigation />
                <Main>
                    <GroupView stigId={stig_id} groupId={group_id} />
                </Main>
                <Footer />
            </StigComponent>
        </ManifestComponent>
    );
}
