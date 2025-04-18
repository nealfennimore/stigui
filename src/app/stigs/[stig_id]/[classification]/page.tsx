import * as Framework from "@/api/entities/Manifest";
import Stig, { Classification } from "@/api/entities/Stig";
import { Footer } from "@/app/components/footer";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { StigView } from "@/app/components/stig";
import ManifestComponent from "@/app/context/manifest";
import StigComponent from "@/app/context/stig";
import type { Metadata, ResolvingMetadata } from "next";
type Props = {
    params: Promise<{ stig_id: string; classification: Classification }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { stig_id, classification } = await params;
    const stig = await Stig.read(`${stig_id}.json`);

    return {
        title: `STIGs | ${stig.metaTitle} | ${classification}`,
        description: stig.description,
        creator: stig.publisher,
        publisher: stig.publisher,
        keywords: [...stig.tags, classification],
        applicationName: "STIGUI",
        openGraph: {
            type: "article",
            title: `STIGs | ${stig.metaTitle}`,
            description: stig.description,
            tags: [...stig.tags, classification],
            url: `https://stig.neal.codes/stigs/${stig_id}`,
            siteName: "STIGUI",
            publishedTime: new Date(stig.date).toISOString(),
        },
    };
}

export async function generateStaticParams() {
    const manifest = await Framework.Manifest.init();
    const classifications = Object.values(Classification);

    return manifest.elements.flatMap((element) =>
        classifications.flatMap((classification) => ({
            stig_id: element.id,
            classification,
        }))
    );
}

export default async function Page({ params }: Props) {
    const { stig_id, classification } = await params;

    return (
        <ManifestComponent>
            <StigComponent stigId={stig_id}>
                <Navigation />
                <Main>
                    <StigView
                        stigId={stig_id}
                        classification={classification}
                    />
                </Main>
                <Footer />
            </StigComponent>
        </ManifestComponent>
    );
}
