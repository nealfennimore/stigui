import * as Framework from "@/api/entities/Manifest";
import Stig from "@/api/entities/Stig";
import { Footer } from "@/app/components/footer";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { StigView } from "@/app/components/stig";
import { APPNAME, URL } from "@/app/constants";
import ManifestComponent from "@/app/context/manifest";
import StigComponent from "@/app/context/stig";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: Promise<{ stig_id: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { stig_id } = await params;
    const stig = await Stig.read(`${stig_id}.json`);

    return {
        title: `STIGs | ${stig.metaTitle}`,
        description: stig.description,
        creator: stig.publisher,
        publisher: stig.publisher,
        keywords: stig.tags,
        applicationName: APPNAME,
        openGraph: {
            type: "article",
            title: `STIGs | ${stig.metaTitle}`,
            description: stig.description,
            tags: stig.tags,
            url: `${URL}/stigs/${stig_id}`,
            siteName: APPNAME,
            authors: [stig.publisher ?? "DISA"],
            publishedTime: new Date(stig.date).toISOString(),
        },
    };
}

export async function generateStaticParams() {
    const manifest = await Framework.Manifest.init();

    return manifest.elements.map((element) => ({
        stig_id: element.id,
    }));
}

export default async function Page({ params }: Props) {
    const { stig_id } = await params;

    return (
        <ManifestComponent>
            <StigComponent stigId={stig_id}>
                <Navigation />
                <Main>
                    <StigView stigId={stig_id} />
                </Main>
                <Footer />
            </StigComponent>
        </ManifestComponent>
    );
}
