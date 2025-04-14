import * as Framework from "@/api/entities/Manifest";
import { Classification } from "@/api/entities/Stig";
import { Footer } from "@/app/components/footer";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { StigView } from "@/app/components/stig";
import ManifestComponent from "@/app/context/manifest";
import StigComponent from "@/app/context/stig";

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

export default async function Page({
    params,
}: {
    params: Promise<{
        stig_id: string;
        classification: Classification;
    }>;
}) {
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
