import * as Framework from "@/api/entities/Manifest";
import { Footer } from "@/app/components/footer";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { StigView } from "@/app/components/stig";
import ManifestComponent from "@/app/context/manifest";
import StigComponent from "@/app/context/stig";

export async function generateStaticParams() {
    const manifest = await Framework.Manifest.init();

    return manifest.elements.map((element) => ({
        stig_id: element.id,
    }));
}

export default async function Page({ params }) {
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
