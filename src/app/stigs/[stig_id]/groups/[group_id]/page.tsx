import * as Framework from "@/api/entities/Manifest";
import Stig, { GroupWrapper } from "@/api/entities/Stig";
import { Footer } from "@/app/components/footer";
import { GroupView } from "@/app/components/group";
import { JsonLd } from "@/app/components/json_ld";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { APPNAME, URL } from "@/app/constants";
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
        applicationName: APPNAME,
        alternates: {
            canonical: `${URL}/stigs/${stig_id}/groups/${group_id}`,
        },
        openGraph: {
            type: "article",
            title: `STIGs | ${stig.metaTitle} | ${group.rule.title}`,
            description: group.rule.description,
            url: `${URL}/stigs/${stig_id}/groups/${group_id}`,
            siteName: APPNAME,
            authors: [stig.publisher ?? "DISA"],
            tags: [
                group.id,
                group.rule.checkId,
                group.rule.fix,
                group.rule.severity,
                group.rule.version,
            ],
            publishedTime: new Date(stig.date).toISOString(),
            images: ["/stigui-border.png"],
        },
        twitter: {
            card: "summary_large_image",
            title: `STIGs | ${stig.metaTitle} | ${group.rule.title}`,
            description: group.rule.description,
            images: ["/stigui-border.png"],
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
    const stig = await Stig.read(`${stig_id}.json`);
    const group = stig.groups.find(
        (group) => group.id === group_id
    ) as GroupWrapper;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "TechArticle",
                headline: group.rule.title,
                description: group.rule.description,
                datePublished: new Date(stig.date).toISOString(),
                version: group.rule.version,
                url: `${URL}/stigs/${stig_id}/groups/${group_id}`,
                keywords: [group.id, group.rule.checkId, group.rule.severity],
                isPartOf: {
                    "@type": "TechArticle",
                    headline: stig.metaTitle,
                    url: `${URL}/stigs/${stig_id}`,
                },
                publisher: {
                    "@type": "Organization",
                    name: stig.publisher ?? "DISA",
                },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "STIGs",
                        item: `${URL}/stigs`,
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: stig.title,
                        item: `${URL}/stigs/${stig_id}`,
                    },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: group.id,
                        item: `${URL}/stigs/${stig_id}/groups/${group_id}`,
                    },
                ],
            },
        ],
    };

    return (
        <ManifestComponent>
            <StigComponent stigId={stig_id}>
                <JsonLd data={jsonLd} />
                <Navigation />
                <Main>
                    <GroupView stigId={stig_id} groupId={group_id} />
                </Main>
                <Footer />
            </StigComponent>
        </ManifestComponent>
    );
}
